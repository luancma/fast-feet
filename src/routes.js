import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import authMiddleware from './app/middlewares/auth';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import OrderController from './app/controllers/OrderController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

routes.post('/files', upload.single('file'), FileController.store);

routes.use(authMiddleware);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

routes.get('/deliverymen', DeliverymanController.index);
routes.post('/deliverymen', DeliverymanController.store);
routes.delete('/deliverymen/:id', DeliverymanController.destroy);
routes.put('/deliverymen/:id', DeliverymanController.update);

routes.get('/order', OrderController.index);
routes.post('/order', OrderController.store);
routes.put('/order/:id', OrderController.update);
routes.delete('/order/:id', OrderController.destroy);

export default routes;
