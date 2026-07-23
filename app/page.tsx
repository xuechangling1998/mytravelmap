"use client";

import { useRef, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";

type City = { name: string; local: string; country: string; lat: number; lon: number };

const cities: City[] = [
  { name: "Shenzhen", local: "深圳", country: "China", lat: 22.5431, lon: 114.0579 },
  { name: "Guangzhou", local: "广州", country: "China", lat: 23.1291, lon: 113.2644 },
  { name: "Hong Kong", local: "香港", country: "China", lat: 22.3193, lon: 114.1694 },
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
  { name: "Altay", local: "阿勒泰", country: "China", lat: 47.8484, lon: 88.1396 },
  { name: "Tokyo", local: "东京", country: "Japan", lat: 35.6762, lon: 139.6503 },
  { name: "Osaka", local: "大阪", country: "Japan", lat: 34.6937, lon: 135.5023 },
  { name: "Kota Kinabalu", local: "哥打京那巴鲁", country: "Malaysia", lat: 5.9804, lon: 116.0735 },
  { name: "Tawau", local: "斗湖", country: "Malaysia", lat: 4.2448, lon: 117.8912 },
  { name: "Istanbul", local: "伊斯坦布尔", country: "Türkiye", lat: 41.0082, lon: 28.9784 },
  { name: "Dubai", local: "迪拜", country: "United Arab Emirates", lat: 25.2048, lon: 55.2708 },
];

const MAP_W = 1100;
const MAP_H = 650;
const countries = feature(
  world as unknown as Parameters<typeof feature>[0],
  (world as unknown as { objects: { countries: Parameters<typeof feature>[1] } }).objects.countries,
) as unknown as GeoJSON.FeatureCollection;
const projection = geoNaturalEarth1().fitExtent([[18, 18], [MAP_W - 18, MAP_H - 18]], countries);
const path = geoPath(projection);

export default function Home() {
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const zoom = (factor: number) => setView((v) => ({ ...v, scale: Math.max(1, Math.min(4, v.scale * factor)) }));
  const reset = () => setView({ scale: 1, x: 0, y: 0 });

  return (
    <main className="experience">
      <div
        className="map-viewport"
        onPointerDown={(event) => {
          drag.current = { x: event.clientX, y: event.clientY, ox: view.x, oy: view.y };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const activeDrag = drag.current;
          if (!activeDrag) return;
          const nextX = activeDrag.ox + event.clientX - activeDrag.x;
          const nextY = activeDrag.oy + event.clientY - activeDrag.y;
          setView((v) => ({ ...v, x: nextX, y: nextY }));
        }}
        onPointerUp={() => { drag.current = null; }}
        onPointerCancel={() => { drag.current = null; }}
        onWheel={(event) => { event.preventDefault(); zoom(event.deltaY < 0 ? 1.12 : .89); }}
      >
        <div className="map-plane" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}>
          <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label="World map showing visited cities">
            <defs>
              <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#21344a" />
                <stop offset="1" stopColor="#112136" />
              </linearGradient>
              <filter id="glow" x="-300%" y="-300%" width="700%" height="700%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feFlood floodColor="#ff9d28" floodOpacity=".95" />
                <feComposite in2="blur" operator="in" />
                <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <g className="countries">
              {countries.features.map((country, index) => <path key={index} d={path(country) ?? ""} />)}
            </g>
            <g className="cities">
              {cities.map((city) => {
                const point = projection([city.lon, city.lat]);
                if (!point) return null;
                return (
                  <g
                    key={city.name}
                    className="city-node"
                    transform={`translate(${point[0]} ${point[1]})`}
                    aria-label={`${city.name}, ${city.country}`}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    <circle className="hit" r="12" />
                    <circle className="halo" r="8" />
                    <circle className="core" r="2.8" />
                    <g className="city-label">
                      <rect x="12" y="-20" width="118" height="39" rx="7" />
                      <text x="22" y="-5">{city.name}</text>
                      <text className="sub" x="22" y="10">{city.country}</text>
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      <header className="hero">
        <h1>The World I’ve Explored</h1>
        <p><strong>5</strong> Countries <span>·</span> <strong>23</strong> Cities</p>
      </header>

      <nav className="map-controls" aria-label="Map controls">
        <button aria-label="Zoom in" onClick={(e) => { e.stopPropagation(); zoom(1.25); }}>+</button>
        <button aria-label="Zoom out" onClick={(e) => { e.stopPropagation(); zoom(.8); }}>−</button>
        <button aria-label="Reset map" onClick={(e) => { e.stopPropagation(); reset(); }}>⌖</button>
      </nav>
      <div className="scale"><span>2,000 km</span><i /></div>
      <div className="hint"><span>↖</span> Drag to explore <b>·</b> Scroll to zoom</div>
    </main>
  );
}
