export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'LittleDalatBot/1.0' },
  });
  if (!res.ok) return `${lat}, ${lng}`;
  const data = await res.json() as any;
  return data.display_name || `${lat}, ${lng}`;
}