"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

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

const cityGeoJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: cities.map((city, index) => ({
    type: "Feature",
    id: index,
    geometry: { type: "Point", coordinates: [city.lon, city.lat] },
    properties: { index, name: city.name, country: city.country },
  })),
};

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [selected, setSelected] = useState<City | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      center: [20, 23],
      zoom: 1.25,
      minZoom: 0.8,
      maxZoom: 8,
      attributionControl: false,
      renderWorldCopies: false,
      style: {
        version: 8,
        sources: {
          world: {
            type: "image",
            url: "/world-offline.png",
            coordinates: [[-180, 82], [180, 82], [180, -60], [-180, -60]],
          },
          "visited-cities": { type: "geojson", data: cityGeoJSON },
        },
        layers: [
          { id: "ocean", type: "background", paint: { "background-color": "#020a14" } },
          { id: "world-map", type: "raster", source: "world", paint: { "raster-opacity": 0.96 } },
          {
            id: "city-halo", type: "circle", source: "visited-cities",
            paint: {
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 12, 5, 20],
              "circle-color": "#ff9f2e", "circle-opacity": 0.2, "circle-blur": 1,
            },
          },
          {
            id: "city-glow", type: "circle", source: "visited-cities",
            paint: {
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 6, 5, 10],
              "circle-color": "#ffb340", "circle-opacity": 0.54, "circle-blur": 0.72,
            },
          },
          {
            id: "city-core", type: "circle", source: "visited-cities",
            paint: {
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 2.5, 5, 4],
              "circle-color": "#fff6c9", "circle-stroke-color": "#ffb13b", "circle-stroke-width": 1.4,
            },
          },
        ],
      },
    });
    mapRef.current = map;

    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 13, className: "city-popup" });
    map.on("mouseenter", "city-core", (event) => {
      map.getCanvas().style.cursor = "pointer";
      const feature = event.features?.[0];
      if (!feature || feature.geometry.type !== "Point") return;
      popup
        .setLngLat(feature.geometry.coordinates as [number, number])
        .setHTML(`<strong>${feature.properties?.name}</strong><span>${feature.properties?.country}</span>`)
        .addTo(map);
    });
    map.on("mouseleave", "city-core", () => {
      map.getCanvas().style.cursor = "";
      popup.remove();
    });
    map.on("click", "city-core", (event) => {
      const index = Number(event.features?.[0]?.properties?.index);
      if (Number.isInteger(index)) setSelected(cities[index]);
    });
    map.on("click", (event) => {
      const hit = map.queryRenderedFeatures(event.point, { layers: ["city-core"] });
      if (!hit.length) setSelected(null);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const zoom = (delta: number) => mapRef.current?.easeTo({ zoom: mapRef.current.getZoom() + delta, duration: 280 });
  const reset = () => mapRef.current?.easeTo({ center: [20, 23], zoom: 1.25, duration: 500 });

  return (
    <main className="experience">
      <div className="map" ref={containerRef} />

      <header className="hero">
        <h1>The World I’ve Explored</h1>
        <p><strong>5</strong> Countries <span>·</span> <strong>23</strong> Cities</p>
      </header>

      <nav className="map-controls" aria-label="Map controls">
        <button aria-label="Zoom in" onClick={() => zoom(1)}>+</button>
        <button aria-label="Zoom out" onClick={() => zoom(-1)}>−</button>
        <button aria-label="Reset map" onClick={reset}>⌖</button>
      </nav>

      <div className="scale"><span>2,000 km</span><i /></div>
      <div className="hint"><span>↖</span> Drag to explore <b>·</b> Scroll to zoom</div>

      <aside className="drawer">
        <button className="close" aria-label="Clear city selection" onClick={() => setSelected(null)}>×</button>
        {selected ? (
          <>
            <h2>{selected.name}</h2>
            <p className="country">{selected.country}</p>
            <p className="local">{selected.local}</p>
            <div className="coordinate">{selected.lat.toFixed(4)}° N · {selected.lon.toFixed(4)}° E</div>
          </>
        ) : (
          <div className="empty">
            <h2>No city selected</h2>
            <p>Click a glowing city to see details</p>
          </div>
        )}
        <div className="mini-map" aria-hidden="true">
          {selected && <i style={{ left: `${(selected.lon + 180) / 3.6}%`, top: `${(90 - selected.lat) / 1.8}%` }} />}
        </div>
      </aside>
    </main>
  );
}
