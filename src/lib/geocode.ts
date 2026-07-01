import { config } from '../config';

let currentKeyIndex = 0;
const keys = [config.googleMapsApiKey, config.googleMapsApiKey2].filter(Boolean);

async function googleGeocode(lat: number, lng: number): Promise<string | null> {
  if (keys.length === 0) return null;
  const key = keys[currentKeyIndex];
  if (!key) return null;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=vi&key=${key}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json() as any;
    if (data.status === 'OVER_QUERY_LIMIT') {
      currentKeyIndex = (currentKeyIndex + 1) % keys.length;
      if (currentKeyIndex === 0) return null;
      return googleGeocode(lat, lng);
    }
    if (data.status !== 'OK' || !data.results?.[0]) return null;
    return data.results[0].formatted_address;
  } catch {
    return null;
  }
}

async function nominatimGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=vi&zoom=18`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'LittleDalatBot/1.0' },
  });
  if (!res.ok) return `${lat}, ${lng}`;
  const data = await res.json() as any;
  const a = data.address;
  if (!a) return data.display_name || `${lat}, ${lng}`;
  const parts: string[] = [];
  if (a.house_number) parts.push(a.house_number);
  if (a.road) parts.push(a.road);
  else if (a.pedestrian) parts.push(a.pedestrian);
  if (a.quarter) parts.push(a.quarter);
  else if (a.suburb) parts.push(a.suburb);
  else if (a.neighbourhood) parts.push(a.neighbourhood);
  if (a.city) parts.push(a.city);
  else if (a.town) parts.push(a.town);
  else if (a.village) parts.push(a.village);
  if (parts.length <= 1 && data.name) return data.name;
  return parts.join(', ');
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const googleResult = await googleGeocode(lat, lng);
  if (googleResult) return googleResult;
  return nominatimGeocode(lat, lng);
}
