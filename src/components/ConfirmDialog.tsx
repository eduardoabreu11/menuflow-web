"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { CheckCircle2, Trash2 } from "lucide-react";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: string;
  description: string;

  type?: "success" | "danger";
  confirmText?: string;
  loading?: boolean;

  onConfirm?: () => void | Promise<void>;
};

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  type = "success",
  confirmText = "Confirmar",
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const isDanger = type === "danger";
  const hasConfirmAction = Boolean(onConfirm);

  async function handleConfirm() {
    if (!onConfirm) {
      onOpenChange(false);
      return;
    }

    await onConfirm();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-4 flex justify-center">
            {isDanger ? (
              <Trash2 className="h-16 w-16 text-red-500" />
            ) : (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
          </div>

          <DialogTitle className="text-center">{title}</DialogTitle>
        </DialogHeader>

        <p className="text-center text-muted-foreground">{description}</p>

        <DialogFooter className="mt-6">
          {hasConfirmAction ? (
            <>
              <Button
                variant="outline"
                disabled={loading}
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>

              <Button
                variant={isDanger ? "destructive" : "default"}
                disabled={loading}
                onClick={handleConfirm}
              >
                {loading ? "Carregando..." : confirmText}
              </Button>
            </>
          ) : (
            <Button
              disabled={loading}
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}