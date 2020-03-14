import Mail from '../../lib/Mail';
class CreateDeliveryEmail {
    get key() {
        return 'CreateDeliveryEmail';
    }

    async handle({ data }) {
        const { foundDeliveryman, foundRecipient, productName } = data;

        await Mail.sendMail({
            to: `${foundDeliveryman.name} <${foundDeliveryman.email}>`,
            subject: 'Encomenda cadastrada',
            template: 'create',
            context: {
                deliveryman: foundDeliveryman.name,
                product: productName,
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