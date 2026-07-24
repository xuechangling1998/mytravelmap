"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";
import {
  City,
  countryNames,
  defaultUpcomingCities,
  defaultVisitedCities,
  findKnownCity,
  normalizeAirport,
  uniqueCities,
} from "./locations";

const MAP_W = 1100;
const MAP_H = 650;
const countries = feature(
  world as unknown as Parameters<typeof feature>[0],
  (world as unknown as { objects: { countries: Parameters<typeof feature>[1] } }).objects.countries,
) as unknown as GeoJSON.FeatureCollection;
const projection = geoNaturalEarth1().fitExtent([[18, 18], [MAP_W - 18, MAP_H - 18]], countries);
const path = geoPath(projection);

type TripRow = Record<string, string | number | Date>;

function endpoints(rows: TripRow[]) {
  return rows.flatMap((row) => [row["出发城市"], row["到达城市"]])
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);
}

function displayCountry(city: City) {
  return countryNames[city.country] ?? city.country;
}

function cityKey(city: City) {
  return `${city.local}|${city.country}`;
}

async function geocodeAirport(airport: string): Promise<City | null> {
  const cacheKey = `travel-map:geocode:${normalizeAirport(airport)}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached) as City;

  const params = new URLSearchParams({
    q: `${airport} 机场`,
    format: "jsonv2",
    addressdetails: "1",
    limit: "1",
    "accept-language": "zh-CN",
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
  if (!response.ok) return null;
  const [match] = await response.json() as Array<{
    lat: string;
    lon: string;
    display_name: string;
    address?: Record<string, string>;
  }>;
  if (!match) return null;

  const address = match.address ?? {};
  const local = address.city || address.town || address.municipality || address.county
    || airport.replace(/(国际机场|机场|国际)$/g, "");
  const city: City = {
    name: airport,
    local,
    country: address.country || match.display_name.split(",").at(-1)?.trim() || "未知",
    lat: Number(match.lat),
    lon: Number(match.lon),
  };
  localStorage.setItem(cacheKey, JSON.stringify(city));
  return city;
}

export default function Home() {
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const [cities, setCities] = useState(defaultVisitedCities);
  const [upcomingCities, setUpcomingCities] = useState(defaultUpcomingCities);
  const [importStatus, setImportStatus] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importedFile, setImportedFile] = useState("");
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("travel-map:import");
    if (!saved) return;
    try {
      const data = JSON.parse(saved) as { visited: City[]; planned: City[]; fileName: string };
      setCities(data.visited);
      setUpcomingCities(data.planned);
      setImportedFile(data.fileName);
    } catch {
      localStorage.removeItem("travel-map:import");
    }
  }, []);

  const zoom = (factor: number) => setView((v) => ({ ...v, scale: Math.max(1, Math.min(4, v.scale * factor)) }));
  const reset = () => setView({ scale: 1, x: 0, y: 0 });
  const visitedCountries = new Set(cities.map((city) => city.country)).size;

  async function resolveAirports(names: string[]) {
    const resolved: City[] = [];
    const unresolved: string[] = [];
    const uniqueNames = [...new Set(names)];
    for (let index = 0; index < uniqueNames.length; index += 1) {
      const airport = uniqueNames[index];
      setImportStatus(`正在匹配城市 ${index + 1}/${uniqueNames.length}`);
      const known = findKnownCity(airport);
      if (known) {
        resolved.push(known);
        continue;
      }
      try {
        const city = await geocodeAirport(airport);
        if (city) resolved.push(city);
        else unresolved.push(airport);
      } catch {
        unresolved.push(airport);
      }
      if (index < uniqueNames.length - 1) {
        await new Promise((done) => window.setTimeout(done, 1050));
      }
    }
    return { cities: uniqueCities(resolved), unresolved };
  }

  async function importTrips(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    setImportStatus("正在读取行程文件…");
    try {
      const XLSX = await import("xlsx");
      const numbers = (await import("xlsx/dist/xlsx.zahl")).default;
      const workbook = XLSX.read(await file.arrayBuffer(), { numbers, cellDates: true });
      const finishedRows: TripRow[] = [];
      const plannedRows: TripRow[] = [];

      for (const sheetName of workbook.SheetNames) {
        const rows = XLSX.utils.sheet_to_json<TripRow>(workbook.Sheets[sheetName], { defval: "" });
        if (sheetName.includes("无效")) continue;
        if (sheetName.includes("待出行")) plannedRows.push(...rows);
        else if (sheetName.includes("已结束")) finishedRows.push(...rows);
        else {
          for (const row of rows) {
            const status = String(row["客票状态"] ?? "");
            if (status.includes("已使用")) finishedRows.push(row);
            else if (status.includes("未使用")) plannedRows.push(row);
          }
        }
      }

      if (!finishedRows.length && !plannedRows.length) {
        throw new Error("没有找到“已结束”或“待出行”的行程数据");
      }

      const visited = await resolveAirports(endpoints(finishedRows));
      const planned = await resolveAirports(endpoints(plannedRows));
      const visitedKeys = new Set(visited.cities.map(cityKey));
      const futureOnly = planned.cities.filter((city) => !visitedKeys.has(cityKey(city)));
      const missing = [...visited.unresolved, ...planned.unresolved];

      setCities(visited.cities);
      setUpcomingCities(futureOnly);
      setImportedFile(file.name);
      localStorage.setItem("travel-map:import", JSON.stringify({
        visited: visited.cities,
        planned: futureOnly,
        fileName: file.name,
      }));
      setView({ scale: 1, x: 0, y: 0 });
      setImportStatus(
        missing.length
          ? `导入完成：${visited.cities.length} 座已到访城市，${futureOnly.length} 座待出行城市；${missing.length} 个地点未匹配`
          : `导入完成：${visited.cities.length} 座已到访城市，${futureOnly.length} 座待出行城市`,
      );
    } catch (error) {
      setImportStatus(error instanceof Error ? `导入失败：${error.message}` : "导入失败，请检查文件格式");
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  }

  function restoreDefault() {
    setCities(defaultVisitedCities);
    setUpcomingCities(defaultUpcomingCities);
    setImportedFile("");
    localStorage.removeItem("travel-map:import");
    setImportStatus("已恢复示例地图");
    setView({ scale: 1, x: 0, y: 0 });
  }

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
                    aria-label={`${city.local}，${displayCountry(city)}`}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    <circle className="hit" r="12" />
                    <circle className="halo" r="8" />
                    <circle className="core" r="2.8" />
                    <g className="city-label">
                      <rect x="12" y="-20" width="118" height="39" rx="7" />
                      <text x="22" y="-5">{city.local}</text>
                      <text className="sub" x="22" y="10">{displayCountry(city)}</text>
                    </g>
                  </g>
                );
              })}
              {upcomingCities.map((city) => {
                const point = projection([city.lon, city.lat]);
                if (!point) return null;
                return (
                  <g
                    key={city.name}
                    className="city-node upcoming"
                    transform={`translate(${point[0]} ${point[1]})`}
                    aria-label={`${city.local}，${displayCountry(city)}，即将点亮`}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    <circle className="hit" r="12" />
                    <circle className="halo" r="8" />
                    <circle className="core" r="2.8" />
                    <g className="city-label">
                      <rect x="12" y="-20" width="128" height="39" rx="7" />
                      <text x="22" y="-5">{city.local}</text>
                      <text className="sub" x="22" y="10">{displayCountry(city)} · 即将点亮</text>
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
        <p><strong>{visitedCountries}</strong> Countries <span>·</span> <strong>{cities.length}</strong> Cities</p>
      </header>

      <div className="import-control">
        <input
          ref={fileInput}
          type="file"
          accept=".numbers,.xls,.xlsx,.csv"
          onChange={importTrips}
          hidden
        />
        <button
          className={`import-icon${isImporting ? " loading" : ""}`}
          onClick={() => fileInput.current?.click()}
          disabled={isImporting}
          aria-label={isImporting ? "正在导入行程" : "导入我的行程"}
          title={isImporting ? "正在导入…" : "导入我的行程"}
        >
          <span className="upload-arrow" aria-hidden="true" />
        </button>
      </div>

      {importStatus && (
        <div className="import-status" role="status">
          <button aria-label="关闭提示" onClick={() => setImportStatus("")}>×</button>
          <strong>{importedFile || "行程导入"}</strong>
          <span>{importStatus}</span>
          {importedFile && <button className="status-restore" onClick={restoreDefault}>恢复示例地图</button>}
        </div>
      )}

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
