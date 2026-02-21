import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type DialogContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("Dialog components must be used within Dialog.Root");
  return ctx;
}

interface DialogRootProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function DialogRoot({ children, open: controlledOpen, onOpenChange }: DialogRootProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const open = useCallback(() => {
    if (!isControlled) setInternalOpen(true);
    onOpenChange?.(true);
  }, [isControlled, onOpenChange]);

  const close = useCallback(() => {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
  }, [isControlled, onOpenChange]);

  return (
    <DialogContext.Provider value={{ isOpen, open, close }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({ children }: { children: React.ReactNode }) {
  const { open } = useDialog();

  return (
    <button type="button" onClick={open}>
      {children}
    </button>
  );
}

function DialogPortal({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useDialog();

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {children}
    </div>,
    document.body,
  );
}

function DialogBackdrop() {
  const { close } = useDialog();

  return (
    <div
      className="absolute inset-0 bg-black/50"
      onClick={close}
      aria-hidden="true"
    />
  );
}

type ViewportSize = "sm" | "md" | "lg";

const viewportSizes: Record<ViewportSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

function DialogViewport({ children, size = "md", className = "" }: { children: React.ReactNode; size?: ViewportSize; className?: string }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`relative z-10 w-full max-h-[90vh] overflow-auto rounded-xl bg-white shadow-2xl ${viewportSizes[size]} ${className}`}
    >
      {children}
    </div>
  );
}

function DialogHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
      {children}
    </div>
  );
}

function DialogClose({ children }: { children: React.ReactNode }) {
  const { close } = useDialog();

  return (
    <button
      type="button"
      onClick={close}
      className="rounded text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-foreground-brand-primary/40"
      aria-label="Close"
    >
      {children}
    </button>
  );
}

function DialogContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-4">
      {children}
    </div>
  );
}

function DialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-gray-200 px-6 py-4">
      {children}
    </div>
  );
}

export const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Portal: DialogPortal,
  Backdrop: DialogBackdrop,
  Viewport: DialogViewport,
  Header: DialogHeader,
  Close: DialogClose,
  Content: DialogContent,
  Footer: DialogFooter,
};
