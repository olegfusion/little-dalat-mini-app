async function photonGeocode(lat: number, lng: number): Promise<string | null> {
  const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json() as any;
    const feature = data.features?.[0]?.properties;
    if (!feature) return null;
    const parts: string[] = [];
    if (feature.housenumber) parts.push(feature.housenumber);
    if (feature.street) parts.push(feature.street);
    if (feature.district) parts.push(feature.district);
    else if (feature.locality) parts.push(feature.locality);
    if (feature.city) parts.push(feature.city);
    else if (feature.town) parts.push(feature.town);
    if (parts.length < 2) return data.features[0].properties.name || null;
    return parts.join(', ');
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
  const photonResult = await photonGeocode(lat, lng);
  if (photonResult) return photonResult;
  return nominatimGeocode(lat, lng);
}
