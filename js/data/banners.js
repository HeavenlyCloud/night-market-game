export const BANNERS = [
  {
    id:"taiwan_standard",
    name:"Taiwan Standard Capsules",
    region:"taiwan",
    rates: {
      Common: 0.70,
      Rare:   0.22,
      Mythic: 0.07,
      Ultra:  0.01
    },
    pity: {
      // after X pulls without Mythic+ give Mythic; after Y without Ultra give Ultra
      mythicAt: 20,
      ultraAt: 80
    },
    featured: {
      // small boost chances for certain items
      itemIds: ["lantern","taipei101"],
      boost: 1.6
    }
  }
];
