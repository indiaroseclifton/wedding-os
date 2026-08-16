import { getPackageByToken } from "./handoffs-store";
import { getWorkspaceMeta } from "./store";
import { getDayOf } from "./dayof-store";
import { listGuests } from "./store";
import { dietarySections, eventDietarySections } from "./dietary";
import { listEvents } from "./events-store";
import { listEventRsvps } from "./event-rsvp-store";
import { getMusic } from "./music-store";
import { listVendors } from "./vendors-store";
import { DEMO_WORKSPACE } from "./workspace";

export async function loadVendorPortal(token: string) {
  const pkg = await getPackageByToken(token);
  if (!pkg) return null;
  const meta = await getWorkspaceMeta(pkg.workspaceId, DEMO_WORKSPACE.name);
  const dayOf = await getDayOf(pkg.workspaceId);
  const live: Record<string, string> = {};
  if (pkg.template === "CATERING" || pkg.template === "CAKE") {
    const guests = await listGuests(pkg.workspaceId);
    Object.assign(live, dietarySections(guests));
    const events = (await listEvents(pkg.workspaceId)).filter((e) => e.rsvpEnabled);
    if (events.length) {
      const rsvps = await listEventRsvps(pkg.workspaceId);
      live.headcount = [
        `Wedding day: ${live.headcount}`,
        ...events.map((e) => {
          const ev = eventDietarySections(guests, rsvps, e.id);
          return `${e.name}: ${ev.headcount}`;
        }),
      ].join("\n");
    }
  }
  if (pkg.template === "DJ") {
    const music = await getMusic(pkg.workspaceId);
    live.must_play = (music.mustPlay || []).join("\n");
    live.do_not_play = (music.doNotPlay || []).join("\n");
    if (music.spotify?.playlistUrl) live.spotify_playlist = music.spotify.playlistUrl;
  }
  if (pkg.template === "PLANNER" || pkg.template === "DAY_OF" || pkg.template === "VENUE") {
    const vendors = await listVendors(pkg.workspaceId);
    live.vendor_list = vendors.map((v) => `${v.category}: ${v.name}`).join("\n");
  }
  const sections = { ...pkg.sections, ...live };
  return {
    pkg,
    meta,
    schedule: dayOf.schedule || [],
    emergencyContact: dayOf.emergencyContact,
    sections,
    liveKeys: Object.keys(live),
  };
}
