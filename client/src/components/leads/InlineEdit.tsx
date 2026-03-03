import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Pencil, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type InlineEditProps = {
  value: string;
  onSave: (value: string) => void;
  isEditingMode: boolean;
  type?: "text" | "email" | "tel" | "textarea" | "select";
  options?: { label: string; value: string }[];
  className?: string;
  copyable?: boolean;
};

export function InlineEdit({ value, onSave, isEditingMode, type = "text", options = [], className, copyable = false }: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (!isEditingMode && isEditing) {
      setIsEditing(false);
      setCurrentValue(value);
    }
  }, [isEditingMode, isEditing, value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onSave(currentValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentValue(value);
    setIsEditing(false);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    toast({
      description: "In die Zwischenablage kopiert",
      duration: 2000,
    });
  };

  const displayValue = type === "select" ? (options.find(o => o.value === value)?.label || value) : value;

  if (!isEditingMode) {
    return (
      <div className={cn("py-1.5 min-h-[32px] text-sm group flex items-center gap-2", className)}>
        <span>{displayValue || <span className="text-muted-foreground italic">Leer</span>}</span>
        {copyable && displayValue && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
            title="Kopieren"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div 
        className={cn(
          "group flex items-center justify-between py-1.5 px-2 -mx-2 rounded-md hover:bg-muted/50 cursor-text min-h-[32px] transition-colors text-sm", 
          className
        )}
        onClick={() => setIsEditing(true)}
      >
        <span>{displayValue || <span className="text-muted-foreground italic">Leer</span>}</span>
        <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 -mx-2 px-2 py-1 bg-muted/30 rounded-md z-10 relative">
      <div className="flex-1">
        {type === "select" ? (
          <Select value={currentValue} onValueChange={setCurrentValue} defaultOpen>
            <SelectTrigger className="h-8 text-sm bg-background border-border shadow-sm">
              <SelectValue placeholder="Auswählen..." />
            </SelectTrigger>
            <SelectContent>
              {options.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : type === "textarea" ? (
          <Textarea 
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={currentValue} 
            onChange={(e) => setCurrentValue(e.target.value)}
            className="min-h-[80px] text-sm bg-background border-border shadow-sm resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
        ) : (
          <Input 
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={type} 
            value={currentValue} 
            onChange={(e) => setCurrentValue(e.target.value)}
            className="h-8 text-sm bg-background border-border shadow-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
        )}
      </div>
      <div className="flex items-center gap-1 pt-0.5">
        <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-100/50" onClick={handleSave}>
          <Check className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}