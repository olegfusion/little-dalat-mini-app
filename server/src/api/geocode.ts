import { Router, Request, Response } from 'express';
import { config } from '../config';
import { getDb } from '../db/schema';

const router = Router();

function initCache(): void {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS geocode_cache (
      query TEXT PRIMARY KEY,
      result TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS geocode_resolve_cache (
      display TEXT PRIMARY KEY,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    )
  `);
}
initCache();

function normalize(q: string): string {
  return q.toLowerCase().replace(/[^a-z0-9\/\s]/g, '').trim();
}

async function gogodukSuggest(q: string): Promise<any[]> {
  const res = await fetch(
    `https://api.gogoduk.com/v1/suggest?input=${encodeURIComponent(q)}&lang=vi`,
    { headers: { 'X-API-Key': config.gogodukKey } }
  );
  const data = await res.json() as any;
  if (!data.predictions?.length) return [];
  return data.predictions.map((p: any) => ({
    display: p.text,
    placeId: p.placeId,
  }));
}

async function gogodukResolve(placeId: string): Promise<{ lat: number; lng: number } | null> {
  const res = await fetch(
    `https://api.gogoduk.com/v1/place/resolve?id=${encodeURIComponent(placeId)}`,
    { headers: { 'X-API-Key': config.gogodukKey } }
  );
  const data = await res.json() as any;
  if (data.result?.lat && data.result?.lon)
    return { lat: data.result.lat, lng: data.result.lon };
  return null;
}

async function goongSearch(q: string): Promise<any[]> {
  if (!config.goongApiKey) return [];
  const res = await fetch(
    `https://rsapi.goong.io/Geocode?address=${encodeURIComponent(q + ', Nha Trang, Khánh Hòa')}&api_key=${config.goongApiKey}`,
    { headers: { 'Referer': 'https://littledalat.nillkin.org/', 'Origin': 'https://littledalat.nillkin.org' } }
  );
  const data = await res.json() as any;
  if (data.status !== 'OK' || !data.results?.length) return [];
  return data.results.filter((r: any) =>
    (r.formatted_address ?? '').toLowerCase().includes('nha trang')
  ).map((r: any) => ({
    display: r.formatted_address,
    lat: r.geometry.location.lat,
    lng: r.geometry.location.lng,
  }));
}

async function nominatimSearch(q: string): Promise<any[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ', Nha Trang, Khánh Hòa')}&format=json&addressdetails=1&limit=5&accept-language=vi`,
    { headers: { 'User-Agent': 'LittleDalatBot/1.0' } }
  );
  const data = await res.json() as any[];
  return data.filter((d: any) => {
    const name = (d.display_name ?? '').toLowerCase();
    return name.includes('nha trang') || name.includes('khánh hòa');
  }).map((d: any) => {
    const a = d.address || {};
    const parts = [a.road || a.pedestrian || '', a.quarter || a.suburb || a.neighbourhood || '', a.city || a.town || ''].filter(Boolean);
    return {
      display: parts.join(', ') || d.display_name?.split(',').slice(0, 3).join(','),
      lat: parseFloat(d.lat),
      lng: parseFloat(d.lon),
    };
  });
}

router.get('/geocode/search', async (req: Request, res: Response) => {
  const q = req.query.q as string;
  if (!q || q.length < 3) { res.json({ suggestions: [] }); return; }

  const key = normalize(q);
  const db = getDb();

  const cached = db.prepare('SELECT result FROM geocode_cache WHERE query = ?').get(key) as any;
  if (cached) {
    res.json({ suggestions: JSON.parse(cached.result) });
    return;
  }

  let suggestions: any[] = [];

  if (config.gogodukKey) {
    const gd = await gogodukSuggest(q);
    if (gd.length) {
      const coords = gogodukResolve(gd[0].placeId);
      const first = await coords;
      suggestions = gd.map((s: any, i: number) => ({
        display: s.display,
        ...(i === 0 && first ? { lat: first.lat, lng: first.lng } : { placeId: s.placeId }),
      })).filter((s: any) => s.display.toLowerCase().includes('nha trang'));
    }
  }

  if (!suggestions.length && config.goongApiKey) {
    suggestions = await goongSearch(q);
  }

  if (!suggestions.length) {
    suggestions = await nominatimSearch(q);
  }

  if (suggestions.length) {
    db.prepare('INSERT OR REPLACE INTO geocode_cache (query, result) VALUES (?, ?)').run(key, JSON.stringify(suggestions));
  }

  res.json({ suggestions });
});

router.get('/geocode/resolve', async (req: Request, res: Response) => {
  const display = req.query.display as string;
  const placeId = req.query.placeId as string;

  if (!display) { res.json({ lat: null, lng: null }); return; }

  const db = getDb();
  const cached = db.prepare('SELECT lat, lng FROM geocode_resolve_cache WHERE display = ?').get(display) as any;
  if (cached) { res.json({ lat: cached.lat, lng: cached.lng }); return; }

  if (placeId && config.gogodukKey) {
    const coords = await gogodukResolve(placeId);
    if (coords) {
      db.prepare('INSERT OR REPLACE INTO geocode_resolve_cache (display, lat, lng) VALUES (?, ?, ?)').run(display, coords.lat, coords.lng);
      res.json(coords);
      return;
    }
  }

  res.json({ lat: null, lng: null });
});

export default router;
