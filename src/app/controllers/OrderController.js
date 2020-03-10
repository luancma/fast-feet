import * as Yup from 'yup';
import {
  parseISO,
  setHours,
  isAfter,
  isBefore,
  setSeconds,
  setMinutes,
} from 'date-fns';

import { Op } from 'sequelize';

import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import CreateDeliveryEmail from '../jobs/CreateDeliveryEmail';
import Queue from '../../lib/Queue';

class OrderController {
  async index(req, res) {
    const { page = 1 } = req.query;

    let deliveries = await Order.findAll({
      where: {
        canceled_at: null,
        product: {
          [Op.iLike]: req.query.q,
        },
      },
      limit: 20,
      offset: (page - 1) * 20,
    });

    if (!deliveries.length) {
      let deliveries = await Order.findAll({
        limit: 20,
        offset: (page - 1) * 20,
        where: {
          canceled_at: null,
        },
      });
      return res.json({ deliveries });
    }

    return res.json(deliveries);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(422).json({ error: 'Please fill in all fields' });
    }

    const { recipient_id, deliveryman_id, signature_id } = req.body;

    const foundRecipient = await Recipient.findByPk(recipient_id);

    if (!foundRecipient) {
      return res.status(404).json({
        error: 'The recipient value is not valid',
      });
    }

    const foundDeliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!foundDeliveryman) {
      return res.status(404).json({
        error: 'The deliveryman value not valid',
      });
    }

    const newOrder = await Order.create(req.body);

    if (!newOrder) {
      return res.status(422).json({
        error: 'Error to create a new order',
      });
    }

    await Queue.add(CreateDeliveryEmail.key, {
      foundDeliveryman,
      foundRecipient,
      productName: req.body.product,
    });

    return res.status(201).json({ newOrder });
  }

  async update(req, res) {
    const paramsShema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await paramsShema.isValid(req.params))) {
      return res.status(422).json({ error: 'Order id is not valid' });
    }

    const foundOrder = await Order.findOne({
      where: {
        id: req.params.id,
        canceled_at: null,
      },
    });

    if (!foundOrder) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    const startDate = parseISO(req.body.start_date);

    const startOfBusinessHours = setSeconds(
      setMinutes(setHours(new Date(), 8), 0),
      0
    );

    const endOfBusinessHours = setSeconds(
      setMinutes(setHours(new Date(), 23), 0),
      0
    );

    if (isBefore(startDate, new Date())) {
      return res.status(422).json({ error: 'Past dates are not accepted' });
    }

    if (
      isBefore(startDate, startOfBusinessHours) ||
      isAfter(startDate, endOfBusinessHours)
    ) {
      return res.status(404).json({ error: 'Out of hours allowed' });
    }

    await foundOrder.update(req.body);

    return res.status(201).json({ message: 'Order updated' });
  }

  async destroy(req, res) {
    const paramsShema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await paramsShema.isValid(req.params))) {
      return res.status(422).json({ error: 'Order id is not valid' });
    }

    const deleteOrder = await Order.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!deleteOrder) {
      return res.status(422).json({ error: 'Error to delete this order' });
    }
    return res.status(201).json({ message: 'Order deleted' });
  }
}
export default new OrderController();
