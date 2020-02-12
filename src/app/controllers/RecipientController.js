import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    const newRecipient = await Recipient.create(req.body);

    if (!newRecipient) {
      return res.status(401).json({ error: 'Error to create a new recipient' });
    }

    return res.json({ newRecipient });
  }

  async update(req, res) {
    const requestId = req.params.id;

    const foundRecipient = await Recipient.findByPk(requestId);

    if (!foundRecipient) {
      return res.status(401).json({ error: 'This recipient is not valid' });
    }

    console.log(foundRecipient);

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
