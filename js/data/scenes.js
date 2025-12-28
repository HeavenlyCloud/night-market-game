export const SCENES = [
  {
    id:"taipei101_skyline",
    region:"taiwan",
    title:"Taipei 101 Skyline",
    desc:"The city hums below — a calm, luminous memory.",
    unlockRule:{ type:"towerLevel", value: 3 }, // ~10+ pulls
    hotspots:[
      { text:"You find a hidden stamp! +10 coins", coins:10 },
      { text:"A street performer plays softly. +10 coins", coins:10 }
    ],
    theme:"taipei"
  },
  {
    id:"jiufen_lanterns",
    region:"taiwan",
    title:"Jiufen Lantern Street",
    desc:"Lanterns glow warmly along winding steps.",
    unlockRule:{ type:"ownedItem", itemId:"lantern", count:1 },
    hotspots:[
      { text:"Wind chimes sing softly. +10 coins", coins:10 },
      { text:"You spot a lucky lantern. +10 coins", coins:10 }
    ],
    theme:"jiufen"
  },
  {
    id:"taroko_gorge",
    region:"taiwan",
    title:"Taroko Gorge",
    desc:"Marble cliffs and river echoes — ancient and quiet.",
    unlockRule:{ type:"ownedItem", itemId:"taroko", count:1 },
    hotspots:[
      { text:"A cool river breeze. +15 coins", coins:15 },
      { text:"A shining pebble path. +15 coins", coins:15 }
    ],
    theme:"taroko"
  }
];
