import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type MenuContextValue = {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("Menu components must be used within Menu.Root");
  return ctx;
}

function MenuRoot({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <MenuContext.Provider value={{ isOpen, toggle, close, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </MenuContext.Provider>
  );
}

function MenuTrigger({ children }: { children: React.ReactNode }) {
  const { toggle, triggerRef } = useMenu();

  return (
    <button ref={triggerRef} type="button" onClick={toggle}>
      {children}
    </button>
  );
}

type Anchor = "bottom-left" | "bottom-right" | "top-left" | "top-right";

function getContentPosition(rect: DOMRect, anchor: Anchor, contentEl: HTMLDivElement | null) {
  const contentWidth = contentEl?.offsetWidth ?? 0;
  const contentHeight = contentEl?.offsetHeight ?? 0;
  const gap = 4;

  switch (anchor) {
    case "bottom-left":
      return { top: rect.bottom + gap, left: rect.left };
    case "bottom-right":
      return { top: rect.bottom + gap, left: rect.right - contentWidth };
    case "top-left":
      return { top: rect.top - contentHeight - gap, left: rect.left };
    case "top-right":
      return { top: rect.top - contentHeight - gap, left: rect.right - contentWidth };
  }
}

function MenuContent({ children, anchor = "bottom-left" }: { children: React.ReactNode; anchor?: Anchor }) {
  const { isOpen, close, triggerRef } = useMenu();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ top: -9999, left: -9999 });

  useEffect(() => {
    if (!isOpen) return;

    const trigger = triggerRef.current;
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      setPosition(getContentPosition(rect, anchor, contentRef.current));
    }

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        contentRef.current &&
        !contentRef.current.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        close();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, close, triggerRef, anchor]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={contentRef}
      style={{ position: "fixed", top: position.top, left: position.left }}
      className="z-50 min-w-[160px] rounded-lg border border-white/10 bg-neutral-900 p-1 shadow-xl"
    >
      {children}
    </div>,
    document.body,
  );
}

function MenuItem({ children, onSelect }: { children: React.ReactNode; onSelect?: () => void }) {
  const { close } = useMenu();

  function handleClick() {
    onSelect?.();
    close();
  }

  return (
    <button type="button" className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-white hover:bg-white/10" onClick={handleClick} >
      {children}
    </button>
  );
}

export const Menu = {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
};
