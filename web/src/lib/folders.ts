export type FolderLinks = {
  drive?: string;
  onedrive?: string;
  icloud?: string;
};

const KEY = "vowfolk-folders";

export function loadFolders(): FolderLinks {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as FolderLinks;
  } catch {
    return {};
  }
}

export function saveFolders(next: FolderLinks) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function driveFolderId(url: string) {
  try {
    const u = new URL(url);
    if (!/drive\.google\.com$/i.test(u.hostname)) return "";
    const m = u.pathname.match(/\/folders\/([^/?]+)/);
    return m?.[1] || u.searchParams.get("id") || "";
  } catch {
    return "";
  }
}

export function driveEmbed(url: string) {
  const id = driveFolderId(url);
  if (!id) return "";
  let resource = "";
  try {
    resource = new URL(url).searchParams.get("resourcekey") || "";
  } catch {
    /* ignore */
  }
  return `https://drive.google.com/embeddedfolderview?id=${id}${resource ? `&resourcekey=${resource}` : ""}#grid`;
}

export function kindOf(url: string): keyof FolderLinks | "" {
  try {
    const h = new URL(url).hostname;
    if (/drive\.google\.com$/i.test(h)) return "drive";
    if (/onedrive\.live\.com|sharepoint\.com|1drv\.ms/i.test(h)) return "onedrive";
    if (/icloud\.com/i.test(h)) return "icloud";
    return "";
  } catch {
    return "";
  }
}
