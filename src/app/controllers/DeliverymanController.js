import Deliveryman from '../models/Deliveryman';
import * as Yup from 'yup';
import File from '../models/File';
import { Op } from 'sequelize';

class DeliverymanController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      name: Yup.string().required(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(422)
        .json({ error: 'Email, name or image are required fields' });
    }

    const deliveryman = await Deliveryman.create(req.body);

    if (!deliveryman) {
      return res.status(401).json({
        error: 'Error to save a new deliveryman',
      });
    }

    return res.json(deliveryman);
  }

  async index(req, res) {
    let deliveryman = await Deliveryman.findAll({
      include: [
        {
          model: File,
          attributes: ['name', 'path', 'url'],
          where: {
            name: {
              [Op.iLike]: req.query.q,
            },
          },
        },
      ],
    });

    if (!deliveryman.length) {
      let deliveryman = await Deliveryman.findAll();
      return res.json(deliveryman);
    }

    return res.json(deliveryman);
  }

  async destroy(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Deliveryman id is not valid' });
    }

    const foundDeliveryman = await Deliveryman.findByPk(req.params.id);

    if (!foundDeliveryman) {
      return res.status(422).json({
        error: 'This deliveryman is not valid',
      });
    }

    await foundDeliveryman.destroy(req.params.id);

    return res.json({
      message: 'Deliveryman deleted',
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Deliveryman id is not valid' });
    }

    const bodySchema = Yup.object().shape({
      email: Yup.string().email(),
    });

    if (!(await bodySchema.isValid(req.body))) {
      return res.status(400).json({ error: 'Deliveryman email is not valid' });
    }

    const foundDeliveryman = await Deliveryman.findByPk(req.params.id);

    if (!foundDeliveryman) {
      return res.status(422).json({
        error: 'This deliveryman is not valid',
      });
    }

    await foundDeliveryman.update(req.body);

    const deliveryman = await Deliveryman.findOne({
      include: [
        {
          model: File,
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(deliveryman);
  }
}

export default new DeliverymanController();
