// ===== Gachapon Globe Data (Taiwan V1+) =====
window.GG_DATA = {
  regions: {
    taiwan: { id: "taiwan", name: "Taiwan", desc: "Neon nights, lantern streets, mountain dawns." }
  },

  banner: {
    id: "taiwan_standard",
    name: "Taiwan Standard Capsules",
    region: "taiwan",
    baseRates: { Common: 0.70, Rare: 0.20, Mythic: 0.09, Ultra: 0.01 },
    pity: { mythicAt: 20, ultraAt: 80 },
    featured: { itemIds: ["lantern", "taipei101", "skylantern"], boost: 1.7 }
  },

  items: [
    // ===== Common =====
    { id: "boba", name: "Bubble Tea", rarity: "Common", icon: "🧋", desc: "Sweet boba from Shilin night market." },
    { id: "stinky", name: "Stinky Tofu", rarity: "Common", icon: "🍢", desc: "Crispy outside, legendary aroma." },
    { id: "riceball", name: "Mini Rice Ball", rarity: "Common", icon: "🍙", desc: "A quick snack for travelers." },
    { id: "postcard", name: "Taiwan Postcard", rarity: "Common", icon: "💌", desc: "A memory captured in print." },
    { id: "nighttoken", name: "Night Market Token", rarity: "Common", icon: "🎟️", desc: "A token from a lively food street." },
    { id: "teaLeaf", name: "Oolong Tea Leaf", rarity: "Common", icon: "🍃", desc: "A fragrant leaf from high mountains." },
    { id: "dumpling", name: "Steam Dumpling", rarity: "Common", icon: "🥟", desc: "Warm comfort food on a rainy day." },
    { id: "metro", name: "Metro Pass", rarity: "Common", icon: "🚇", desc: "Tap in — the city opens up." },
    { id: "pineapple", name: "Pineapple Cake", rarity: "Common", icon: "🍍", desc: "Buttery sweet souvenir classic." },
    { id: "scallion", name: "Scallion Pancake", rarity: "Common", icon: "🥞", desc: "Crisp layers and street vibes." },
    { id: "milkTea", name: "Milk Tea Cup", rarity: "Common", icon: "🧉", desc: "A cozy sip for late nights." },
    { id: "umbrella", name: "Travel Umbrella", rarity: "Common", icon: "🌂", desc: "Taiwan rain? Always ready." },
    { id: "coinPouch", name: "Coin Pouch", rarity: "Common", icon: "👛", desc: "Tiny pouch, huge convenience." },
    { id: "sticker", name: "Kawaii Sticker", rarity: "Common", icon: "🧷", desc: "Decorate your passport & laptop." },
    { id: "snackBag", name: "Snack Bag", rarity: "Common", icon: "🛍️", desc: "Full of mysterious crunchy joy." },
    { id: "redBean", name: "Red Bean Bun", rarity: "Common", icon: "🥮", desc: "Soft, sweet, and comforting." },

    // ===== Rare =====
    { id: "lantern", name: "Lantern Charm", rarity: "Rare", icon: "🏮", desc: "A lucky charm from Jiufen’s lantern street." },
    { id: "taipei101", name: "Taipei 101 Keychain", rarity: "Rare", icon: "🏙️", desc: "A shiny keychain from Taipei’s skyline." },
    { id: "taroko", name: "Taroko Marble Stone", rarity: "Rare", icon: "🪨", desc: "A smooth stone from Taroko Gorge." },
    { id: "alishan", name: "Alishan Dawn Photo", rarity: "Rare", icon: "🌄", desc: "Sunrise over misty peaks." },
    { id: "nightBadge", name: "Night Market Badge", rarity: "Rare", icon: "🏷️", desc: "A badge that says: I survived the food street." },
    { id: "teaTin", name: "Tea Tin", rarity: "Rare", icon: "🫙", desc: "Sealed aroma from mountain farms." },
    { id: "hikingTag", name: "Hiking Tag", rarity: "Rare", icon: "🥾", desc: "Trail token from misty paths." },
    { id: "templeCharm", name: "Temple Charm", rarity: "Rare", icon: "🧿", desc: "A charm from incense-lit halls." },
    { id: "railTicket", name: "Old Rail Ticket", rarity: "Rare", icon: "🎫", desc: "A nostalgic ticket from another time." },
    { id: "bubbleWand", name: "Bubble Wand", rarity: "Rare", icon: "🫧", desc: "It makes the machine feel magical." },

    // ===== Mythic =====
    { id: "lotus", name: "Lotus Pond Blessing", rarity: "Mythic", icon: "🪷", desc: "A serene blessing from Kaohsiung." },
    { id: "skylantern", name: "Sky Lantern Wish", rarity: "Mythic", icon: "🎐", desc: "A wish carried into the night." },
    { id: "temple", name: "Temple Fortune", rarity: "Mythic", icon: "🧧", desc: "A fortune slip that feels… accurate." },
    { id: "hotSpring", name: "Hot Spring Steam", rarity: "Mythic", icon: "♨️", desc: "Warm mist — calm restored." },
    { id: "rainSong", name: "Rainy Alley Song", rarity: "Mythic", icon: "🎶", desc: "A melody echoing through old streets." },
    { id: "dragonBoat", name: "Dragon Boat Spirit", rarity: "Mythic", icon: "🐉", desc: "A festival pulse in your chest." },
    { id: "moonBridge", name: "Moon Bridge Reflection", rarity: "Mythic", icon: "🌙", desc: "A quiet reflection that feels infinite." },

    // ===== Ultra =====
    { id: "goldcapsule", name: "Golden Capsule", rarity: "Ultra", icon: "✨", desc: "Legendary memory — extremely rare." },
    { id: "towerCore", name: "Tower Core Relic", rarity: "Ultra", icon: "🔮", desc: "A relic that makes the Tower glow." },
    { id: "phoenixRelic", name: "Phoenix Relic", rarity: "Ultra", icon: "🪽", desc: "A mythic flare — the Tower trembles." },
    { id: "jadeSeal", name: "Jade Seal", rarity: "Ultra", icon: "🟩", desc: "A seal of ownership and fate." }
  ],

  scenes: [
    {
      id: "taipei101_skyline",
      title: "Taipei 101 Skyline",
      desc: "The city hums below — a calm, luminous memory.",
      theme: "taipei",
      unlock: { type: "towerLevel", value: 3 },
      hotspots: [
        { text: "You find a hidden stamp! +10 coins", coins: 10 },
        { text: "A street performer plays softly. +10 coins", coins: 10 }
      ]
    },
    {
      id: "jiufen_lanterns",
      title: "Jiufen Lantern Street",
      desc: "Lanterns glow warmly along winding steps.",
      theme: "jiufen",
      unlock: { type: "ownedItem", itemId: "lantern", count: 1 },
      hotspots: [
        { text: "Wind chimes sing softly. +12 coins", coins: 12 },
        { text: "A lantern flickers with luck! +12 coins", coins: 12 }
      ]
    },
    {
      id: "taroko_gorge",
      title: "Taroko Gorge",
      desc: "Marble cliffs and river echoes — ancient and quiet.",
      theme: "taroko",
      unlock: { type: "ownedItem", itemId: "taroko", count: 1 },
      hotspots: [
        { text: "Cool river breeze. +15 coins", coins: 15 },
        { text: "A shining pebble path. +15 coins", coins: 15 }
      ]
    }
  ],

  cosmetics: [
    { id: "skin_ribbon", name: "Ribbon Capsule Skin", icon: "🎀", cost: 250, desc: "Adds cute ribbon styling on capsule reveal cards." },
    { id: "theme_night", name: "Night Market Theme", icon: "🌙", cost: 400, desc: "Deepens the background + adds neon tint." },
    { id: "trail_sparkle", name: "Sparkle Trail", icon: "✨", cost: 300, desc: "Extra sparkles on pulls + stronger Ultra burst." },
    { id: "theme_sunrise", name: "Alishan Sunrise Theme", icon: "🌄", cost: 450, desc: "Warmer sunrise glow background." },
    { id: "ui_glassplus", name: "Glass+ UI Polish", icon: "🫧", cost: 350, desc: "Panels look clearer + less blurry." },
    { id: "sfx_chimes", name: "Lucky Chimes SFX Pack", icon: "🔔", cost: 280, desc: "Adds extra chime on Rare+ pulls." },
    { id: "confetti_boost", name: "Confetti Booster", icon: "🎊", cost: 320, desc: "More particles on Mythic/Ultra celebrations." },
    { id: "capsule_window_fx", name: "Capsule Window Glow", icon: "💠", cost: 260, desc: "Machine window glows when rolling." }

  ]
};
