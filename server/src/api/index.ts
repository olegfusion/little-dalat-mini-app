import { Router } from 'express';
import menuRouter from './menu';
import ordersRouter from './orders';
import paymentRouter from './payment';
import deliveryRouter from './delivery';
import geocodeRouter from './geocode';

const apiRouter = Router();

apiRouter.use(menuRouter);
apiRouter.use(ordersRouter);
apiRouter.use(paymentRouter);
apiRouter.use(deliveryRouter);
apiRouter.use(geocodeRouter);

export default apiRouter;
