import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const shortcuts = [
    { key: "Ctrl + K / ⌘K", description: "Open command palette & search" },
    { key: "C", description: "Create a new issue" },
    { key: "[", description: "Collapse or expand sidebar" },
    { key: "G then O", description: "Go to Workspace Overview (Home)" },
    { key: "G then P", description: "Go to Projects catalog" },
    { key: "Esc", description: "Close dialogs, menus, and drawer" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[20px] border border-border bg-white p-5 shadow-none">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-semibold text-[#0D0D0D]">
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#575657]">
            Press keys anywhere when no input or text area is focused.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3 space-y-2">
          {shortcuts.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between py-2 border-b border-border/60 last:border-b-0 text-[13px]"
            >
              <span className="text-[#575657]">{s.description}</span>
              <kbd className="inline-flex items-center rounded-[6px] border border-border bg-[#F1F1F3] px-2 py-0.5 font-mono text-[11px] font-medium text-[#0D0D0D]">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
