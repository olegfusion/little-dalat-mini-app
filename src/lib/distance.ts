import { config } from '../config';

export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function getDeliveryFee(km: number): number | null {
  if (km <= 4) return config.delivery.feeWithin4km;
  if (km <= 6) return config.delivery.fee4to6km;
  if (km <= 8) return config.delivery.fee6to8km;
  return null;
}
