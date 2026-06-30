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

type ActionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: string;
  description: string;

  type?: "success" | "danger";
  confirmText?: string;
  loading?: boolean;

  onConfirm?: () => void | Promise<void>;
};

export default function ActionDialog({
  open,
  onOpenChange,
  title,
  description,
  type = "success",
  confirmText = "Confirmar",
  loading = false,
  onConfirm,
}: ActionDialogProps) {
  const isDanger = type === "danger";

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

        {isDanger && (
          <DialogFooter>
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button variant="destructive" disabled={loading} onClick={onConfirm}>
              {loading ? "Carregando..." : confirmText}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}