import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useAppState } from "@/lib/app-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Pencil, Check, X, Clock, Trash2 } from "lucide-react";
import { parseUTC } from "@/lib/utils";

export function ActivityFeed({ leadId }: { leadId: string }) {
  const { leads, addActivity, updateActivity, deleteActivity, users } = useAppState();
  const lead = leads.find(l => l.id === leadId);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  if (!lead) return null;

  const sortedActivities = [...lead.activities].sort(
    (a, b) => parseUTC(b.timestamp).getTime() - parseUTC(a.timestamp).getTime()
  );

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addActivity(leadId, newComment.trim());
    setNewComment("");
  };

  const handleSaveEdit = (activityId: string) => {
    if (!editValue.trim()) return;
    updateActivity(leadId, activityId, editValue.trim());
    setEditingId(null);
  };

  const handleDelete = (activityId: string) => {
    if (!window.confirm("Kommentar unwiderruflich löschen?")) return;
    deleteActivity(leadId, activityId);
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-xl border shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b bg-muted/20 flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          Aktivitäten & Notizen
        </h3>
      </div>

      <div className="flex-1 overflow-auto p-5 space-y-6">
        {sortedActivities.map((activity) => {
          const author = users.find(u => u.id === activity.authorId);
          const isSystem = activity.type === "system";

          if (isSystem) {
            return (
              <div key={activity.id} className="flex gap-4 items-center text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-border ml-3" />
                <span>{activity.text}</span>
                <span className="text-xs opacity-60">
                  {format(parseUTC(activity.timestamp), "dd. MMM HH:mm", { locale: de })}
                </span>
              </div>
            );
          }

          const isEditing = editingId === activity.id;

          return (
            <div key={activity.id} className="flex gap-4 group">
              <Avatar className="w-8 h-8 border mt-0.5 shrink-0">
                <AvatarFallback className="text-xs bg-primary/5 text-primary">
                  {author?.name?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm min-w-0">
                    <span className="font-medium text-foreground shrink-0">{author?.name || "Unbekannt"}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {format(parseUTC(activity.timestamp), "dd. MMM yyyy, HH:mm", { locale: de })}
                      {activity.updatedAt && " (bearbeitet)"}
                    </span>
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          setEditingId(activity.id);
                          setEditValue(activity.text);
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(activity.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2 mt-2">
                    <Textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="min-h-[80px] text-sm resize-none focus-visible:ring-1"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="w-3.5 h-3.5 mr-1" /> Abbrechen
                      </Button>
                      <Button size="sm" onClick={() => handleSaveEdit(activity.id)}>
                        <Check className="w-3.5 h-3.5 mr-1" /> Speichern
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm bg-muted/40 rounded-xl rounded-tl-sm p-3 border border-border/50 text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {activity.text}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {sortedActivities.length === 0 && (
          <div className="text-center py-10 text-sm text-muted-foreground">
            Noch keine Aktivitäten vorhanden.
          </div>
        )}
      </div>

      <div className="p-4 bg-muted/10 border-t">
        <div className="relative">
          <Textarea
            placeholder="Neue Notiz hinzufügen..."
            className="min-h-[80px] resize-none pb-12 text-sm"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                handleAddComment();
              }
            }}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground hidden sm:inline-block mr-2">
              Cmd/Ctrl + Enter zum Speichern
            </span>
            <Button
              size="sm"
              className="h-8 shadow-sm"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              Speichern <Send className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
