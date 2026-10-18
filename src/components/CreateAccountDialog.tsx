import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { disableDemoMode } from "@/lib/demoMode";

interface CreateAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAccountDialog({
  open,
  onOpenChange,
}: CreateAccountDialogProps) {
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    onOpenChange(false);
    disableDemoMode();
    navigate("/signup");
  };

  const handleLogIn = () => {
    onOpenChange(false);
    disableDemoMode();
    navigate("/login");
  };

  const handleKeepExploring = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-6 rounded-[16px] bg-white border border-black/10 shadow-xl">
        <DialogHeader className="text-left space-y-2">
          <DialogTitle className="text-[20px] font-semibold text-[#0D0D0D] tracking-tight">
            Create a free account
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[#575657] leading-relaxed">
            The demo is for exploring. To create your own workspace, sign up for a free account.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2 sm:gap-2 sm:justify-end">
          <button
            type="button"
            onClick={handleKeepExploring}
            className="order-3 sm:order-1 px-4 py-2 text-[14px] font-medium text-[#575657] hover:text-[#0D0D0D] hover:bg-black/[0.04] rounded-lg transition-colors cursor-pointer select-none"
          >
            Keep exploring
          </button>
          <button
            type="button"
            onClick={handleLogIn}
            className="order-2 px-4 py-2 text-[14px] font-medium text-[#0D0D0D] bg-white border border-black/15 hover:border-black/30 hover:bg-black/[0.02] rounded-lg transition-colors cursor-pointer select-none"
          >
            Log in
          </button>
          <button
            type="button"
            onClick={handleCreateAccount}
            className="order-1 sm:order-3 px-4 py-2 text-[14px] font-medium text-white bg-[#0D0D0D] hover:bg-[#232325] rounded-lg transition-colors cursor-pointer select-none"
          >
            Create account
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
