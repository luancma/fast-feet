import Deliveryman from '../models/Deliveryman';

class DeliverymanController {
  async store(req, res) {
    const deliveryman = await Deliveryman.create(req.body);

    if (!deliveryman) {
      return res.status(401).json({
        error: 'Error to save a new deliveryman',
      });
    }

    return res.json(deliveryman);
  }
}

export default new DeliverymanController();
