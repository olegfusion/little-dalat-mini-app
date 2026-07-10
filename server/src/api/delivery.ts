import { Router, Request, Response } from 'express';
import { getDeliveryFee, haversineDistance } from '../lib/distance';
import { config } from '../config';

const router = Router();

router.post('/delivery/estimate', (req: Request, res: Response) => {
  const { lat, lng, itemCount } = req.body;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    res.status(400).json({ error: 'lat and lng (numbers) required' });
    return;
  }
  const shop = config.shop;
  const km = haversineDistance(shop.lat, shop.lng, lat, lng);
  const baseFee = getDeliveryFee(km);
  const qty = typeof itemCount === 'number' ? itemCount : 0;
  const isFree = baseFee !== null && qty >= 5;
  const fee = isFree ? -1 : baseFee;

  res.json({
    km: Math.round(km * 10) / 10,
    fee,
    isFree,
    available: fee !== null,
    maxRadius: config.delivery.maxRadius,
  });
});

export default router;
