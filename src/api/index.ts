import { Router } from 'express';
import menuRouter from './menu';
import ordersRouter from './orders';
import paymentRouter from './payment';
import deliveryRouter from './delivery';

const apiRouter = Router();

apiRouter.use(menuRouter);
apiRouter.use(ordersRouter);
apiRouter.use(paymentRouter);
apiRouter.use(deliveryRouter);

export default apiRouter;
