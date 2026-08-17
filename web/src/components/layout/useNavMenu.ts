"use client";

import { useEffect, useRef, useState } from "react";

export function useNavMenu() {
  const [open, setOpen] = useState<string | null>(null);
  const enter = useRef(0);
  const leave = useRef(0);
  const hover = useRef(false);

  useEffect(() => {
    hover.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, []);

  function clear() {
    window.clearTimeout(enter.current);
    window.clearTimeout(leave.current);
  }

  function intend(id: string) {
    if (!hover.current) return;
    clear();
    enter.current = window.setTimeout(() => setOpen(id), 70);
  }

  function delayClose() {
    if (!hover.current) return;
    clear();
    leave.current = window.setTimeout(() => setOpen(null), 160);
  }

  function toggle(id: string) {
    clear();
    setOpen((cur) => (cur === id ? null : id));
  }

  function close() {
    clear();
    setOpen(null);
  }

  useEffect(() => () => clear(), []);

  return { open, intend, delayClose, toggle, close };
}
