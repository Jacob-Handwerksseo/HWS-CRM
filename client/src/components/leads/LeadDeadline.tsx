import { useState } from "react";
import { format, isAfter, isBefore, isToday, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarDays, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useAppState } from "@/lib/app-state";

interface LeadDeadlineProps {
  leadId: string;
  deadline: string | null;
  className?: string;
  showIcon?: boolean;
  variant?: "badge" | "picker" | "text";
}

export function getDeadlineStatus(dateString: string | null) {
  if (!dateString) return { color: "text-muted-foreground", bg: "bg-muted/50", label: "Keine Frist", status: "none" };
  
  const date = new Date(dateString);
  const today = startOfDay(new Date());
  const deadlineDate = startOfDay(date);
  
  if (isBefore(deadlineDate, today)) {
    return { color: "text-red-700 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", border: "border-red-200 dark:border-red-800", label: "Überfällig", status: "overdue" };
  }
  
  if (isToday(deadlineDate)) {
    return { color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/30", border: "border-orange-200 dark:border-orange-800", label: "Heute", status: "today" };
  }
  
  return { color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", border: "border-emerald-200 dark:border-emerald-800", label: "In der Frist", status: "future" };
}

export function LeadDeadline({ leadId, deadline, className, showIcon = true, variant = "badge" }: LeadDeadlineProps) {
  const { updateLeadField } = useAppState();
  const status = getDeadlineStatus(deadline);
  
  const handleSelect = (date: Date | undefined) => {
    updateLeadField(leadId, "nextFollowUp", date ? date.toISOString() : null);
  };

  const formattedDate = deadline ? format(new Date(deadline), "dd.MM.yyyy", { locale: de }) : "Frist setzen";

  if (variant === "text") {
    return (
      <div className={cn("flex items-center gap-1.5 text-xs", status.color, className)}>
        {showIcon && <CalendarDays className="w-3.5 h-3.5" />}
        {deadline ? format(new Date(deadline), "dd.MM.yyyy", { locale: de }) : ""}
      </div>
    );
  }

  if (variant === "badge") {
    return (
      <div className={cn("flex items-center gap-1.5 text-xs px-2 py-1 rounded-md w-fit border", status.bg, status.color, status.border, className)}>
        {showIcon && <CalendarDays className="w-3.5 h-3.5" />}
        {formattedDate}
      </div>
    );
  }

  // Picker variant
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-auto justify-start text-left font-normal h-8 px-3 text-sm",
            !deadline && "text-muted-foreground",
            deadline && status.color,
            deadline && status.bg,
            deadline && status.border,
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formattedDate}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={deadline ? new Date(deadline) : undefined}
          onSelect={handleSelect}
          initialFocus
        />
        {deadline && (
          <div className="p-3 border-t">
            <Button 
              variant="ghost" 
              className="w-full h-8 text-xs text-muted-foreground" 
              onClick={() => handleSelect(undefined)}
            >
              Frist entfernen
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
