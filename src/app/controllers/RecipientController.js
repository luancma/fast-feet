import Recipient from '../models/Recipient';
import * as Yup from 'yup';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zip_code: Yup.string().required(),
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
