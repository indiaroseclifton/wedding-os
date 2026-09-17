import { worldAabb, type Aabb } from "./layout";
import type { PlacedItem } from "./types";

export type AlignMode =
  | "left"
  | "centerX"
  | "right"
  | "top"
  | "centerY"
  | "bottom"
  | "distributeX"
  | "distributeY";

type Move = { id: string; x: number; y: number };

function cx(b: Aabb) {
  return (b.minX + b.maxX) / 2;
}
function cy(b: Aabb) {
  return (b.minY + b.maxY) / 2;
}

export function alignedMoves(items: PlacedItem[], mode: AlignMode): Move[] {
  const live = items.filter((i) => !i.locked);
  if (live.length < 2) return [];
  if ((mode === "distributeX" || mode === "distributeY") && live.length < 3) return [];

  const boxes = live.map((item) => ({ item, box: worldAabb(item) }));
  const minX = Math.min(...boxes.map((b) => b.box.minX));
  const maxX = Math.max(...boxes.map((b) => b.box.maxX));
  const minY = Math.min(...boxes.map((b) => b.box.minY));
  const maxY = Math.max(...boxes.map((b) => b.box.maxY));
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;

  if (mode === "distributeX") {
    const ordered = boxes.slice().sort((a, b) => cx(a.box) - cx(b.box));
    const first = cx(ordered[0].box);
    const last = cx(ordered[ordered.length - 1].box);
    const step = (last - first) / (ordered.length - 1);
    return ordered.map((entry, i) => {
      const target = first + step * i;
      return { id: entry.item.id, x: entry.item.x + (target - cx(entry.box)), y: entry.item.y };
    });
  }
  if (mode === "distributeY") {
    const ordered = boxes.slice().sort((a, b) => cy(a.box) - cy(b.box));
    const first = cy(ordered[0].box);
    const last = cy(ordered[ordered.length - 1].box);
    const step = (last - first) / (ordered.length - 1);
    return ordered.map((entry, i) => {
      const target = first + step * i;
      return { id: entry.item.id, x: entry.item.x, y: entry.item.y + (target - cy(entry.box)) };
    });
  }

  return boxes.map(({ item, box }) => {
    let dx = 0;
    let dy = 0;
    if (mode === "left") dx = minX - box.minX;
    if (mode === "right") dx = maxX - box.maxX;
    if (mode === "centerX") dx = midX - cx(box);
    if (mode === "top") dy = minY - box.minY;
    if (mode === "bottom") dy = maxY - box.maxY;
    if (mode === "centerY") dy = midY - cy(box);
    return { id: item.id, x: item.x + dx, y: item.y + dy };
  });
}
