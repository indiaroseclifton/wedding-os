import { detectStore, hostLabel, zolaKey, type KnownStore } from "@/lib/registry-stores";
import { ZolaEmbed } from "./ZolaEmbed";

export type ShopLink = { id?: string; store: string; url: string };

export function StoreCards({
  links,
  onRemove,
}: {
  links: ShopLink[];
  onRemove?: (id: string) => void;
}) {
  const zola = links.find((l) => zolaKey(l.url));
  const rest = links.filter((l) => l !== zola);

  return (
    <div className="space-y-3">
      {zola ? <ZolaEmbed url={zola.url} /> : null}
      <ul className="grid gap-3 sm:grid-cols-2">
        {rest.map((l) => {
          const known = detectStore(l.url);
          return (
            <li key={l.id || l.url}>
              <StoreCard link={l} known={known} onRemove={l.id && onRemove ? () => onRemove(l.id!) : undefined} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StoreCard({
  link,
  known,
  onRemove,
}: {
  link: ShopLink;
  known: KnownStore | null;
  onRemove?: () => void;
}) {
  const name = known?.name || link.store || hostLabel(link.url);
  return (
    <article className="flex min-h-[8.5rem] flex-col justify-between rounded-2xl border border-line bg-surface p-5">
      <div>
        <p className="kicker">Shop</p>
        <h3 className="mt-1 font-serif text-2xl tracking-tight">{name}</h3>
        <p className="mt-1 text-sm text-muted">{known?.line || "Opens their site. We don’t keep the cart."}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <a href={link.url} target="_blank" rel="noreferrer" className="btn btn-primary">
          Shop on {name}
        </a>
        {onRemove ? (
          <button type="button" onClick={onRemove} className="text-xs text-muted underline">
            Remove
          </button>
        ) : null}
      </div>
    </article>
  );
}
