// Basic Taipei MRT stations (sample list). Add more whenever you want.
window.TPE_STATIONS = [
  { id:"taipei_main", name:"Taipei Main Station", lat:25.0478, lng:121.5170, lines:["red","blue","green"] },
  { id:"ximen", name:"Ximen", lat:25.0420, lng:121.5080, lines:["blue","green"] },
  { id:"cks", name:"Chiang Kai-Shek Memorial Hall", lat:25.0345, lng:121.5217, lines:["red","green"] },
  { id:"daan", name:"Daan", lat:25.0331, lng:121.5436, lines:["red","brown"] },
  { id:"zhongxiao_fuxing", name:"Zhongxiao Fuxing", lat:25.0416, lng:121.5437, lines:["blue","brown"] },
  { id:"tpe101", name:"Taipei 101/World Trade Center", lat:25.0337, lng:121.5645, lines:["red"] },
  { id:"jiantan", name:"Jiantan", lat:25.0846, lng:121.5259, lines:["red"] },
  { id:"shilin", name:"Shilin", lat:25.0880, lng:121.5250, lines:["red"] },
  { id:"songshan", name:"Songshan", lat:25.0503, lng:121.5781, lines:["green"] },
  { id:"dongmen", name:"Dongmen", lat:25.0330, lng:121.5295, lines:["red","orange"] },
  { id:"nangang", name:"Nangang", lat:25.0520, lng:121.6070, lines:["blue"] },
  { id:"taipei_zoo", name:"Taipei Zoo", lat:24.9987, lng:121.5810, lines:["brown"] }
];

// Tourist spots (expandable). category is used for filters.
window.TPE_SPOTS = [
  { id:"spot_101", name:"Taipei 101", category:"Landmark", lat:25.033968, lng:121.564468, near:"tpe101" },
  { id:"spot_elephant", name:"Elephant Mountain Trailhead", category:"Hike/View", lat:25.0270, lng:121.5705 },
  { id:"spot_cks", name:"Chiang Kai-shek Memorial Hall", category:"Historic", lat:25.0345, lng:121.5217, near:"cks" },
  { id:"spot_longshan", name:"Longshan Temple", category:"Temple", lat:25.0369, lng:121.4997 },
  { id:"spot_shilin_nm", name:"Shilin Night Market", category:"Night Market", lat:25.0880, lng:121.5250, near:"shilin" },
  { id:"spot_raohe", name:"Raohe Night Market", category:"Night Market", lat:25.0501, lng:121.5770, near:"songshan" },
  { id:"spot_daan", name:"Daan Forest Park", category:"Park", lat:25.0323, lng:121.5345 },
  { id:"spot_huashan", name:"Huashan 1914 Creative Park", category:"Art/Culture", lat:25.0440, lng:121.5290 },
  { id:"spot_palace", name:"National Palace Museum", category:"Museum", lat:25.1024, lng:121.5485 },
  { id:"spot_zoo", name:"Taipei Zoo", category:"Zoo", lat:24.9987, lng:121.5810, near:"taipei_zoo" },
  { id:"spot_ximen", name:"Ximending Pedestrian Area", category:"Shopping", lat:25.0426, lng:121.5069, near:"ximen" },
  { id:"spot_redhouse", name:"The Red House", category:"Art/Culture", lat:25.0422, lng:121.5063, near:"ximen" }
];

// MRT line colors used in the UI
window.MRT_LINE_COLORS = {
  red:   "#d40000",
  green: "#00a650",
  blue:  "#0070c0",
  orange:"#ff7f00",
  brown: "#8a5a2b"
};

// Sample polyline paths (not full network). You can add more points or more lines.
window.MRT_LINES = [
  { id:"red", name:"Red Line (sample)", color: MRT_LINE_COLORS.red, path:[
    [25.0880,121.5250], // Shilin (approx segment)
    [25.0846,121.5259], // Jiantan
    [25.0478,121.5170], // Taipei Main
    [25.0345,121.5217], // CKS
    [25.0337,121.5645]  // Taipei 101
  ]},
  { id:"blue", name:"Blue Line (sample)", color: MRT_LINE_COLORS.blue, path:[
    [25.0420,121.5080], // Ximen
    [25.0478,121.5170], // Taipei Main
    [25.0416,121.5437], // Zhongxiao Fuxing
    [25.0520,121.6070]  // Nangang
  ]},
  { id:"green", name:"Green Line (sample)", color: MRT_LINE_COLORS.green, path:[
    [25.0420,121.5080], // Ximen
    [25.0478,121.5170], // Taipei Main
    [25.0345,121.5217], // CKS
    [25.0503,121.5781]  // Songshan
  ]},
  { id:"brown", name:"Brown Line (sample)", color: MRT_LINE_COLORS.brown, path:[
    [25.0416,121.5437], // Zhongxiao Fuxing (transfer-ish)
    [25.0331,121.5436], // Daan (approx)
    [24.9987,121.5810]  // Taipei Zoo
  ]}
];
