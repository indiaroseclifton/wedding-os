import { getDataBackend, type DataBackend } from "./types";

export function getBackend(): DataBackend {
  return getDataBackend();
}

export { getDataBackend } from "./types";
export type * from "./types";
