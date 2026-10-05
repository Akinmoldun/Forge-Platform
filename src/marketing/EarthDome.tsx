/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { geoOrthographic, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import landTopo from 'world-atlas/land-110m.json';

const land = feature(landTopo as any, (landTopo as any).objects.land);
const grat = geoGraticule10();
const SPHERE = { type: 'Sphere' } as const;
const CITIES: [number, number][] = [
  [-122, 37], [-74, 40], [-0.1, 51], [13, 52], [77, 28], [103, 1],
  [139, 35], [151, -33], [-46, -23], [18, -34], [31, 30], [55, 25],
];
const LINKS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [2, 10], [10, 11], [11, 4],
  [4, 5], [5, 6], [6, 7], [2, 9], [8, 9], [1, 8],
];

export default function EarthDome() {
  const [rot, setRot] = useState(60);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setRot(60);
      return;
    }

    let frameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const delta = Math.min(currentTime - lastTime, 100);
      lastTime = currentTime;
      setRot((r) => (r + delta * 0.004) % 360);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        cancelAnimationFrame(frameId);
        setRot(60);
      } else {
        lastTime = performance.now();
        frameId = requestAnimationFrame(animate);
      }
    };

    mediaQuery.addEventListener?.('change', handleMediaChange);

    return () => {
      cancelAnimationFrame(frameId);
      mediaQuery.removeEventListener?.('change', handleMediaChange);
    };
  }, []);

  const W = 1600, H = 620;
  const projection = geoOrthographic()
    .scale(900).translate([W / 2, 1020]).rotate([-rot, -25]).clipAngle(90);
  const path = geoPath(projection);
  const dots = CITIES.map((c) => projection(c));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%"
      preserveAspectRatio="xMidYMin meet" style={{ display: 'block' }} aria-hidden="true">
      <defs>
        <radialGradient id="earthOcean" cx="50%" cy="8%" r="95%">
          <stop offset="0%" stopColor="#FFEFE4" />
          <stop offset="100%" stopColor="#FFD2B3" />
        </radialGradient>
        <filter id="earthGlow" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <path d={path(SPHERE) ?? ''} fill="none" stroke="#F36421"
        strokeWidth="10" opacity="0.35" filter="url(#earthGlow)" />
      <path d={path(SPHERE) ?? ''} fill="url(#earthOcean)" stroke="#F36421" strokeWidth="2" />
      <path d={path(grat) ?? ''} fill="none" stroke="#F36421" strokeOpacity="0.12" />
      <path d={path(land as any) ?? ''} fill="#FF7A33" stroke="#D9531E" strokeWidth="0.8" />
      {LINKS.map(([a, b], i) => (
        <path key={i} fill="none" stroke="#F36421" strokeOpacity="0.55" strokeWidth="1.2"
          d={path({ type: 'LineString' as const, coordinates: [CITIES[a], CITIES[b]] }) ?? ''} />
      ))}
      {dots.map((p, i) => p && <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#3B1500" />)}
    </svg>
  );
}
