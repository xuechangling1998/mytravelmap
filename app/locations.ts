export type City = {
  name: string;
  local: string;
  country: string;
  lat: number;
  lon: number;
  photo?: string;
  photoLabel?: string;
  photoAspect?: number;
};

export const countryNames: Record<string, string> = {
  China: "中国",
  Japan: "日本",
  Malaysia: "马来西亚",
  Türkiye: "土耳其",
  "New Zealand": "新西兰",
  Finland: "芬兰",
  Norway: "挪威",
};

export const defaultVisitedCities: City[] = [
  { name: "Shenzhen", local: "深圳", country: "China", lat: 22.5431, lon: 114.0579 },
  { name: "Guangzhou", local: "广州", country: "China", lat: 23.1291, lon: 113.2644 },
  { name: "Hong Kong", local: "香港", country: "China", lat: 22.3193, lon: 114.1694, photo: "photos/hong-kong.jpg", photoLabel: "迪士尼酒店", photoAspect: 2 / 3 },
  { name: "Shanghai", local: "上海", country: "China", lat: 31.2304, lon: 121.4737 },
  { name: "Beijing", local: "北京", country: "China", lat: 39.9042, lon: 116.4074 },
  { name: "Harbin", local: "哈尔滨", country: "China", lat: 45.8038, lon: 126.5349 },
  { name: "Jiamusi", local: "佳木斯", country: "China", lat: 46.7998, lon: 130.3189 },
  { name: "Shenyang", local: "沈阳", country: "China", lat: 41.8057, lon: 123.4315 },
  { name: "Qingdao", local: "青岛", country: "China", lat: 36.0671, lon: 120.3826 },
  { name: "Xi’an", local: "西安", country: "China", lat: 34.3416, lon: 108.9398 },
  { name: "Chengdu", local: "成都", country: "China", lat: 30.5728, lon: 104.0668 },
  { name: "Chongqing", local: "重庆", country: "China", lat: 29.563, lon: 106.5516 },
  { name: "Guiyang", local: "贵阳", country: "China", lat: 26.647, lon: 106.6302 },
  { name: "Kunming", local: "昆明", country: "China", lat: 25.0389, lon: 102.7183 },
  { name: "Ürümqi", local: "乌鲁木齐", country: "China", lat: 43.8256, lon: 87.6168 },
  { name: "Yining", local: "伊宁", country: "China", lat: 43.9771, lon: 81.5275 },
  { name: "Altay", local: "阿勒泰", country: "China", lat: 47.8484, lon: 88.1396, photo: "photos/altay.jpg", photoLabel: "喀纳斯", photoAspect: 2 / 3 },
  { name: "Zunyi", local: "遵义", country: "China", lat: 27.7257, lon: 106.9272 },
  { name: "Tokyo", local: "东京", country: "Japan", lat: 35.6762, lon: 139.6503, photo: "photos/tokyo.jpg", photoLabel: "镰仓", photoAspect: 3 / 4 },
  { name: "Osaka", local: "大阪", country: "Japan", lat: 34.6937, lon: 135.5023, photo: "photos/osaka.jpg", photoAspect: 3 / 2 },
  { name: "Kota Kinabalu", local: "哥打京那巴鲁", country: "Malaysia", lat: 5.9804, lon: 116.0735 },
  { name: "Tawau", local: "斗湖", country: "Malaysia", lat: 4.2448, lon: 117.8912, photo: "photos/tawau.jpg", photoLabel: "仙本那", photoAspect: 2 / 3 },
  { name: "Istanbul", local: "伊斯坦布尔", country: "Türkiye", lat: 41.0082, lon: 28.9784, photo: "photos/istanbul.jpg", photoLabel: "博斯普鲁斯海峡", photoAspect: 2 / 3 },
];

export const defaultUpcomingCities: City[] = [
  { name: "Auckland", local: "奥克兰", country: "New Zealand", lat: -36.8509, lon: 174.7645 },
  { name: "Christchurch", local: "基督城", country: "New Zealand", lat: -43.5321, lon: 172.6362 },
  { name: "Helsinki", local: "赫尔辛基", country: "Finland", lat: 60.1699, lon: 24.9384 },
  { name: "Oslo", local: "奥斯陆", country: "Norway", lat: 59.9139, lon: 10.7522 },
  { name: "Bodø", local: "博德", country: "Norway", lat: 67.2804, lon: 14.4049 },
  { name: "Svolvær", local: "斯沃尔韦尔", country: "Norway", lat: 68.2343, lon: 14.5683 },
  { name: "Tromsø", local: "特罗姆瑟", country: "Norway", lat: 69.6492, lon: 18.9553 },
];

const airportAliases = new Map<string, City>();

function addAliases(city: City, ...aliases: string[]) {
  for (const alias of aliases) airportAliases.set(normalizeAirport(alias), city);
}

for (const city of [...defaultVisitedCities, ...defaultUpcomingCities]) {
  addAliases(city, city.name, city.local);
}

addAliases(defaultVisitedCities[0], "深圳宝安", "深圳宝安国际");
addAliases(defaultVisitedCities[1], "广州白云", "广州白云国际");
addAliases(defaultVisitedCities[2], "香港国际", "香港");
addAliases(defaultVisitedCities[3], "上海浦东", "上海虹桥");
addAliases(defaultVisitedCities[4], "北京首都", "北京大兴");
addAliases(defaultVisitedCities[5], "哈尔滨太平");
addAliases(defaultVisitedCities[6], "佳木斯松江国际");
addAliases(defaultVisitedCities[7], "沈阳桃仙");
addAliases(defaultVisitedCities[8], "青岛胶东", "青岛流亭");
addAliases(defaultVisitedCities[9], "西安咸阳");
addAliases(defaultVisitedCities[10], "成都双流", "成都天府");
addAliases(defaultVisitedCities[11], "重庆江北");
addAliases(defaultVisitedCities[12], "贵阳龙洞堡");
addAliases(defaultVisitedCities[13], "昆明长水");
addAliases(defaultVisitedCities[14], "乌鲁木齐天山", "乌鲁木齐地窝堡");
addAliases(defaultVisitedCities[15], "伊犁伊宁国际", "伊宁国际");
addAliases(defaultVisitedCities[16], "阿勒泰雪都");
addAliases(defaultVisitedCities[17], "遵义新舟", "遵义茅台");
addAliases(defaultVisitedCities[18], "东京羽田", "东京成田");
addAliases(defaultVisitedCities[19], "大阪关西", "大阪伊丹");
addAliases(defaultVisitedCities[20], "哥打京那巴鲁");
addAliases(defaultVisitedCities[21], "斗湖");
addAliases(defaultVisitedCities[22], "伊斯坦布尔", "伊斯坦布尔萨比哈");
addAliases(defaultUpcomingCities[0], "奥克兰", "奥克兰国际");
addAliases(defaultUpcomingCities[1], "基督城国际", "基督城");
addAliases(defaultUpcomingCities[2], "赫尔辛基万塔", "赫尔辛基");
addAliases(defaultUpcomingCities[3], "奥斯陆");
addAliases(defaultUpcomingCities[4], "博德");
addAliases(defaultUpcomingCities[5], "斯沃尔韦尔");
addAliases(defaultUpcomingCities[6], "特罗姆瑟");

export function normalizeAirport(value: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s·•\-—_()（）]/g, "")
    .replace(/(internationalairport|airport|国际机场|机场|航站楼)$/g, "");
}

export function findKnownCity(airport: string) {
  return airportAliases.get(normalizeAirport(airport));
}

export function uniqueCities(items: City[]) {
  const seen = new Set<string>();
  return items.filter((city) => {
    const key = `${city.local}|${city.country}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
