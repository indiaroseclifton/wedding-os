export const DIY_PHOTOS: Record<string, string> = {
  flowers: "/brand/flowers.jpg",
  "table-decor": "/brand/setting.jpg",
  signage: "/brand/paper.jpg",
  lighting: "/brand/candles.jpg",
  cake: "/brand/cake.jpg",
  backdrop: "/brand/garden.jpg",
  favors: "/brand/setting.jpg",
  "welcome-bags": "/brand/flowers.jpg",
  bar: "/brand/candles.jpg",
  "cake-table": "/brand/cake.jpg",
};

export function diyPhoto(slug: string) {
  return DIY_PHOTOS[slug] || "/brand/garden.jpg";
}
