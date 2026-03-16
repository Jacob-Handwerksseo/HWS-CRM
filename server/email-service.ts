import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { storage } from "./storage";
import { log } from "./index";

let pollingInterval: NodeJS.Timeout | null = null;

function extractNameFromEmail(from: string): string {
  const match = from.match(/^"?([^"<]+)"?\s*</);
  if (match) return match[1].trim();
  const emailMatch = from.match(/([^@]+)@/);
  if (emailMatch) return emailMatch[1].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return from;
}

function extractPhoneFromText(text: string): string {
  const phoneRegex = /(?:\+?\d{1,4}[\s-]?)?(?:\(?\d{2,5}\)?[\s-]?)?\d{3,}[\s-]?\d{2,}/g;
  const matches = text.match(phoneRegex);
  if (matches) {
    for (const m of matches) {
      const digits = m.replace(/\D/g, "");
      if (digits.length >= 7 && digits.length <= 15) return m.trim();
    }
  }
  return "";
}

function extractCompanyFromText(text: string): string {
  const patterns = [
    /(?:Firma|Unternehmen|Company|Organisation)[:\s]+([^\n,]+)/i,
    /(?:GmbH|AG|e\.V\.|KG|OHG|UG|Ltd|Inc)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim();
  }

  return "";
}

async function checkForNewEmails() {
  const config = await storage.getEmailConfig();
  if (!config || !config.enabled) return;

  let client: ImapFlow | null = null;

  try {
    client = new ImapFlow({
      host: config.imapServer,
      port: config.imapPort,
      secure: config.imapPort === 993,
      auth: {
        user: config.email,
        pass: config.password,
      },
      logger: false,
    });

    await client.connect();
    const lock = await client.getMailboxLock("INBOX");

    try {
      const lastUid = config.lastCheckedUid ? parseInt(config.lastCheckedUid, 10) : 0;
      const searchQuery = lastUid > 0 ? { uid: `${lastUid + 1}:*` } : { unseen: true };

      let maxUid = lastUid;
      let newLeadCount = 0;

      for await (const message of client.fetch(searchQuery, {
        envelope: true,
        source: true,
        uid: true,
      })) {
        if (message.uid <= lastUid) continue;

        const parsed = await simpleParser(message.source);
        const fromAddress = parsed.from?.value?.[0];
        if (!fromAddress) continue;

        const senderEmail = fromAddress.address || "";
        const senderName = fromAddress.name || extractNameFromEmail(senderEmail);
        const subject = parsed.subject || "Kein Betreff";
        const bodyText = parsed.text || "";

        const existingLeads = await storage.getLeads();
        const alreadyExists = existingLeads.some(
          (l) => l.email.toLowerCase() === senderEmail.toLowerCase() && l.source === "E-Mail"
        );

        if (!alreadyExists && senderEmail) {
          const phone = extractPhoneFromText(bodyText);
          const company = extractCompanyFromText(bodyText);

          const lead = await storage.createLead({
            name: senderName,
            company: company || "Unbekannt",
            status: "Neu",
            source: "E-Mail",
            assignedTo: null,
            phone,
            email: senderEmail,
            website: "",
            address: "",
            notes: `Betreff: ${subject}\n\n${bodyText.substring(0, 500)}`,
          });

          await storage.createActivity({
            leadId: lead.id,
            type: "system",
            text: `Lead automatisch aus E-Mail erstellt. Betreff: "${subject}"`,
            authorId: null,
          });

          newLeadCount++;
        }

        if (message.uid > maxUid) {
          maxUid = message.uid;
        }
      }

      if (maxUid > lastUid) {
        await storage.updateEmailConfig(config.id, {
          lastCheckedUid: maxUid.toString(),
        });
      }

      if (newLeadCount > 0) {
        log(`${newLeadCount} neue(r) Lead(s) aus E-Mails erstellt`, "email");
      }
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (error: any) {
    log(`E-Mail-Abruf fehlgeschlagen: ${error.message}`, "email");
    if (client) {
      try { await client.logout(); } catch {}
    }
  }
}

export function startEmailPolling() {
  if (pollingInterval) return;

  checkForNewEmails();

  pollingInterval = setInterval(checkForNewEmails, 5 * 60 * 1000);
  log("E-Mail-Polling gestartet (alle 5 Minuten)", "email");
}

export function stopEmailPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    log("E-Mail-Polling gestoppt", "email");
  }
}

export async function testEmailConnection(imapServer: string, imapPort: number, email: string, password: string): Promise<{ success: boolean; message: string }> {
  let client: ImapFlow | null = null;
  try {
    client = new ImapFlow({
      host: imapServer,
      port: imapPort,
      secure: imapPort === 993,
      auth: { user: email, pass: password },
      logger: false,
    });

    await client.connect();
    await client.logout();
    return { success: true, message: "Verbindung erfolgreich!" };
  } catch (error: any) {
    if (client) {
      try { await client.logout(); } catch {}
    }
    return { success: false, message: `Verbindung fehlgeschlagen: ${error.message}` };
  }
}

export { checkForNewEmails };
