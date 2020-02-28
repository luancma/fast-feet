import Deliveryman from '../models/Deliveryman';
import * as Yup from 'yup';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import {
  setHours,
  setMinutes,
  setSeconds,
  isBefore,
  isAfter,
  parseISO,
  isToday,
} from 'date-fns';

class DeliverymanDeliveriesController {
  async index(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(422).json({ error: 'Id is required' });
    }

    const deliveryman = await Deliveryman.findByPk(req.params.id);

    if (!deliveryman) {
      return res.status(401).json({
        error: 'Error to find the deliveryman with that id',
      });
    }

    const deliveries = await Order.findAll({
      where: {
        deliveryman_id: deliveryman.id,
        canceled_at: null,
        end_date: null,
      },
      attributes: ['id', 'product', 'start_date', 'end_date'],
      include: [
        {
          model: Recipient,
          as: 'recipients',
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'state',
            'city',
            'zip_code',
          ],
        },
      ],
    });

    return res.json({
      deliveries,
    });
  }

  async put(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
      orderid: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(422).json({ error: 'Id is required' });
    }

    const foundOrder = await Order.findByPk(req.params.orderid);

    if (!foundOrder) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    const allOrders = await Order.findAll({
      where: {
        deliveryman_id: req.params.id,
      },
    });

    let countDay = 0;

    allOrders.map(item => {
      if (isToday(item.start_date)) {
        countDay++;
      }
    });

    if (countDay > 5) {
      return res.json({
        error: 'You already made the maximum number of order pickup for today',
      });
    }

    const startDate = parseISO(req.body.start_date);

    const startOfBusinessHours = setSeconds(
      setMinutes(setHours(new Date(), 8), 0),
      0
    );

    const endOfBusinessHours = setSeconds(
      setMinutes(setHours(new Date(), 23), 59),
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
}

export default new DeliverymanDeliveriesController();
