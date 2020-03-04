import Recipient from '../models/Recipient';
import * as Yup from 'yup';
import { Op } from 'sequelize';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zip_code: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(422).json({ error: 'Please fill in all fields' });
    }

    const newRecipient = await Recipient.create(req.body);

    if (!newRecipient) {
      return res.status(401).json({ error: 'Error to create a new recipient' });
    }

    return res.json({ newRecipient });
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const foundRecipient = await Recipient.findAll({
      where: {
        name: {
          [Op.iLike]: req.query.q,
        },
      },
      limit: 20,
      offset: (page - 1) * 20,
    });

    if (!foundRecipient.length) {
      const foundRecipient = await Recipient.findAll({
        limit: 20,
        offset: (page - 1) * 20,
      });
      return res.json(foundRecipient);
    }

    return res.json(foundRecipient);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(422).json({ error: 'Recipient id is not valid' });
    }

    const requestId = req.params.id;

    const foundRecipient = await Recipient.findByPk(requestId);

    if (!foundRecipient) {
      return res.status(401).json({ error: 'This recipient is not valid' });
    }

    const {
      id,
      name,
      street,
      number,
      state,
      city,
      zip_code,
    } = await foundRecipient.update(req.body);

    return res.json({
      id,
      name,
      street,
      number,
      state,
      city,
      zip_code,
    });
  }
}

export default new RecipientController();
