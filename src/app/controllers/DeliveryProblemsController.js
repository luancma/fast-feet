import Order from '../models/Order';
import Problem from '../models/Problem';
import * as Yup from 'yup';

class DeliveryProblemsController {
  async index(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(422).json({ error: 'Delivery ID is required!' });
    }

    const foundDelivery = await Order.findOne({
      where: {
        id: req.params.id,
        canceled_at: null,
      },
    });

    if (!foundDelivery) {
      res.status(404).json({
        error: 'Delivery is not found',
      });
    }

    const problems = await Problem.findAll({
      where: {
        delivery_id: req.params.id,
      },
      attributes: ['id', 'description'],
    });

    if (!problems) {
      return res.json({ error: 'Error to fetch delivery problems' });
    }

    return res.json({
      problems,
    });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      delivery_id: Yup.number().required(),
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(422)
        .json({ error: 'Delivery ID and Description are required!' });
    }

    const foundDelivery = await Order.findOne({
      where: {
        id: req.params.id,
        canceled_at: null,
      },
    });

    if (!foundDelivery) {
      res.status(404).json({
        error: 'Delivery is not found',
      });
    }

    await Problem.create(req.body);

    return res.status(201).json({});
  }

  async destroy(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(422).json({ error: 'Delivery ID is required!' });
    }

    const foundDelivery = await Order.findOne({
      where: {
        id: req.params.id,
        canceled_at: null,
      },
    });

    if (!foundDelivery) {
      res.status(404).json({
        error: 'Delivery is not found',
      });
    }

    foundDelivery.canceled_at = new Date();
    await foundDelivery.save();

    return res.status(201).json();
  }
}

export default new DeliveryProblemsController();
