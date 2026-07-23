"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type City = {
  name: string;
  local: string;
  country: string;
  lat: number;
  lon: number;
};

const cities: City[] = [
  { name: "Shenzhen", local: "深圳", country: "China", lat: 22.54, lon: 113.93 },
  { name: "Guangzhou", local: "广州", country: "China", lat: 23.13, lon: 113.26 },
  { name: "Hong Kong", local: "香港", country: "China", lat: 22.31, lon: 113.92 },
  { name: "Shanghai", local: "上海", country: "China", lat: 31.23, lon: 121.47 },
  { name: "Beijing", local: "北京", country: "China", lat: 39.90, lon: 116.40 },
  { name: "Harbin", local: "哈尔滨", country: "China", lat: 45.80, lon: 126.53 },
  { name: "Jiamusi", local: "佳木斯", country: "China", lat: 46.80, lon: 130.32 },
  { name: "Shenyang", local: "沈阳", country: "China", lat: 41.80, lon: 123.43 },
  { name: "Qingdao", local: "青岛", country: "China", lat: 36.07, lon: 120.38 },
  { name: "Xi’an", local: "西安", country: "China", lat: 34.34, lon: 108.94 },
  { name: "Chengdu", local: "成都", country: "China", lat: 30.57, lon: 104.07 },
  { name: "Chongqing", local: "重庆", country: "China", lat: 29.56, lon: 106.55 },
  { name: "Guiyang", local: "贵阳", country: "China", lat: 26.65, lon: 106.63 },
  { name: "Kunming", local: "昆明", country: "China", lat: 25.04, lon: 102.71 },
  { name: "Ürümqi", local: "乌鲁木齐", country: "China", lat: 43.83, lon: 87.62 },
  { name: "Yining", local: "伊宁", country: "China", lat: 43.98, lon: 81.32 },
  { name: "Altay", local: "阿勒泰", country: "China", lat: 47.85, lon: 88.13 },
  { name: "Tokyo", local: "东京", country: "Japan", lat: 35.68, lon: 139.76 },
  { name: "Osaka", local: "大阪", country: "Japan", lat: 34.69, lon: 135.50 },
  { name: "Kota Kinabalu", local: "哥打京那巴鲁", country: "Malaysia", lat: 5.98, lon: 116.07 },
  { name: "Tawau", local: "斗湖", country: "Malaysia", lat: 4.25, lon: 117.89 },
  { name: "Istanbul", local: "伊斯坦布尔", country: "Türkiye", lat: 41.01, lon: 28.98 },
  { name: "Dubai", local: "迪拜", country: "United Arab Emirates", lat: 25.20, lon: 55.27 },
];

const project = (lon: number, lat: number, width: number, height: number) => ({
  x: (.371 + lon * .00207) * width,
  y: (.615 - lat * .0049) * height,
});

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const transform = useRef({ scale: 1, x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [hovered, setHovered] = useState<City | null>(null);
  const [selected, setSelected] = useState<City | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = wrap.clientWidth;
    const height = wrap.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const t = transform.current;
    if (surfaceRef.current) {
      surfaceRef.current.style.transform = `translate(${t.x}px, ${t.y}px) scale(${t.scale})`;
    }
    ctx.save();
    ctx.translate(width / 2 + t.x, height / 2 + t.y);
    ctx.scale(t.scale, t.scale);
    ctx.translate(-width / 2, -height / 2);

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    cities.forEach((city) => {
      const p = project(city.lon, city.lat, width, height);
      const x = p.x;
      const y = p.y;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 15);
      glow.addColorStop(0, "rgba(255,255,224,1)");
      glow.addColorStop(.12, "rgba(255,190,78,.95)");
      glow.addColorStop(.4, "rgba(255,145,38,.32)");
      glow.addColorStop(1, "rgba(255,118,16,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff8cf";
      ctx.beginPath();
      ctx.arc(x, y, 1.45, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
    ctx.restore();
  }, []);

  useEffect(() => {
    draw();
    const resize = new ResizeObserver(draw);
    if (wrapRef.current) resize.observe(wrapRef.current);
    return () => resize.disconnect();
  }, [draw]);

  const hitTest = (clientX: number, clientY: number) => {
    const wrap = wrapRef.current;
    if (!wrap) return null;
    const rect = wrap.getBoundingClientRect();
    const width = wrap.clientWidth;
    const height = wrap.clientHeight;
    const t = transform.current;
    const mx = (clientX - rect.left - width / 2 - t.x) / t.scale + width / 2;
    const my = (clientY - rect.top - height / 2 - t.y) / t.scale + height / 2;
    return cities.find((city) => {
      const p = project(city.lon, city.lat, width, height);
      return Math.hypot(p.x - mx, p.y - my) < 12;
    }) ?? null;
  };

  const zoom = (factor: number) => {
    transform.current.scale = Math.max(.85, Math.min(4, transform.current.scale * factor));
    draw();
  };

  const reset = () => {
    transform.current = { scale: 1, x: 0, y: 0 };
    draw();
  };

  return (
    <main className="experience" onClick={() => selected && setSelected(null)}>
      <header className="hero">
        <h1>The World I’ve Explored</h1>
        <p className="stats"><strong>5</strong> Countries <span>·</span> <strong>23</strong> Cities</p>
      </header>

      <button className="globe-button" aria-label="Reset world map" onClick={(event) => { event.stopPropagation(); reset(); }}>◎</button>
      <button className="about-button" aria-label="About this map">?</button>

      <div
        className={`map-wrap ${drag.current ? "dragging" : ""}`}
        ref={wrapRef}
        onClick={(event) => {
          event.stopPropagation();
          const city = hitTest(event.clientX, event.clientY);
          setSelected(city);
        }}
        onPointerDown={(event) => {
          const t = transform.current;
          drag.current = { x: event.clientX, y: event.clientY, ox: t.x, oy: t.y };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          setPointer({ x: event.clientX, y: event.clientY });
          if (drag.current) {
            transform.current.x = drag.current.ox + event.clientX - drag.current.x;
            transform.current.y = drag.current.oy + event.clientY - drag.current.y;
            draw();
          } else {
            setHovered(hitTest(event.clientX, event.clientY));
          }
        }}
        onPointerUp={() => { drag.current = null; }}
        onPointerLeave={() => { drag.current = null; setHovered(null); }}
        onWheel={(event) => { event.preventDefault(); zoom(event.deltaY < 0 ? 1.12 : .89); }}
      >
        <div className="map-surface" ref={surfaceRef} aria-hidden="true">
          <div className="prototype-mask mask-header" />
          <div className="prototype-mask mask-drawer" />
        </div>
        <canvas ref={canvasRef} aria-label="Interactive map of visited cities" />
      </div>

      {hovered && !drag.current && (
        <div className="tooltip" style={{ left: pointer.x + 16, top: pointer.y - 10 }}>
          <strong>{hovered.name}</strong>
          <span>{hovered.country}</span>
        </div>
      )}

      <nav className="map-controls" aria-label="Map controls">
        <button aria-label="Zoom in" onClick={() => zoom(1.25)}>+</button>
        <button aria-label="Zoom out" onClick={() => zoom(.8)}>−</button>
        <button aria-label="Reset map" onClick={reset}>⌖</button>
      </nav>

      <div className="scale"><span>2,000 km</span><i /></div>
      <div className="hint"><span>↖</span> Drag to explore <b>·</b> Scroll to zoom</div>

      <aside className="drawer open" onClick={(event) => event.stopPropagation()}>
        <button className="close" aria-label="Close city details" onClick={() => setSelected(null)}>×</button>
        {selected ? (
          <>
            <h2>{selected.name}</h2>
            <p className="country">{selected.country}</p>
            <div className="mini-world" aria-hidden="true">
              <i style={{ left: `${(selected.lon + 180) / 3.6}%`, top: `${(90 - selected.lat) / 1.8}%` }} />
            </div>
          </>
        ) : (
          <div className="empty-drawer">
            <h2>No city selected</h2>
            <p>Click on a city to see details</p>
            <div className="mini-world empty" aria-hidden="true" />
          </div>
        )}
      </aside>
    </main>
  );
}
