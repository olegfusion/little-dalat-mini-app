import { Router, Request, Response } from 'express';
import { generateVietQR } from '../lib/vietqr';

const router = Router();

router.post('/payment/qr', (req: Request, res: Response) => {
  const { orderId, amount } = req.body;
  if (!orderId || !amount) {
    res.status(400).json({ error: 'orderId and amount required' });
    return;
  }
  const qr = generateVietQR(orderId, amount);
  res.json(qr);
});

export default router;
