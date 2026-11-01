import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ConfirmationDialogProps {
  cancelLabel?: string;
  confirmLabel?: string;
  confirmingLabel?: string;
  description: string;
  isConfirming?: boolean;
  isOpen: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  title: string;
}

export function ConfirmationDialog({
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  confirmingLabel = 'Confirming…',
  description,
  isConfirming = false,
  isOpen,
  onConfirm,
  onOpenChange,
  title,
}: ConfirmationDialogProps) {
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!isConfirming) onOpenChange(open);
      }}
      open={isOpen}
    >
      <DialogContent
        className="gap-6 rounded-2xl p-6 sm:max-w-xl sm:p-7"
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="min-w-0 space-y-2 text-left">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription className="min-w-0 [overflow-wrap:anywhere]">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="-mx-6 -mb-6 flex-row min-w-0 w-full items-center justify-end gap-3 rounded-b-2xl border-t border-border/70 bg-muted/40 px-6 py-4 sm:-mx-7 sm:-mb-7 sm:px-7">
          <Button
            disabled={isConfirming}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
            size="lg"
          >
            {cancelLabel}
          </Button>
          <Button
            disabled={isConfirming}
            onClick={onConfirm}
            type="button"
            size="lg"
            variant="destructive"
          >
            {isConfirming ? confirmingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
