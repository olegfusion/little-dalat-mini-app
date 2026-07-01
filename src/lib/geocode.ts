export async function reverseGeocode(lat: number, lng: number): Promise<string> {
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