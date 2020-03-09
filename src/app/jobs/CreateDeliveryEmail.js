import Mail from '../../lib/Mail';
import pt from 'date-fns/locale/pt';
class CreateDeliveryEmail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { foundDeliveryman, foundRecipient } = data;

    await Mail.sendMail({
      to: `${foundDeliveryman.name} <${foundDeliveryman.email}>`,
      subject: 'Encomenda cadastrada',
      template: 'create',
      context: {
        deliveryman: foundDeliveryman.name,
        product: req.body.product,
        recipient: foundRecipient.name,
        street: foundRecipient.street,
        number: foundRecipient.number,
        state: foundRecipient.state,
        city: foundRecipient.city,
        cep: foundRecipient.zip_code,
      },
    });
  }
}

export default new CreateDeliveryEmail();
