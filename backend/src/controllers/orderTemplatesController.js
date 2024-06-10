const orderTemplatesRepository = require('../repositories/orderTemplatesRepository');
const actionsRepository = require('../repositories/actionsRepository');

async function getOrderTemplate(req, res, next) {
    const id = req.params.id;
    const orderTemplate = await orderTemplatesRepository.getOrderTemplate(id);
    res.json(orderTemplate);
}

async function getOrderTemplates(req, res, next) {
    const symbol = req.params.symbol;
    const page = req.query.page;
    const result = await orderTemplatesRepository.getOrderTemplates(symbol, page)
    res.json(result);
}

function validatePrice(price) {
    if (!price) return true;
    if (parseFloat(price)) return true;
    return /^(MEMORY\[\'.+?\'\](\..+)*)$/i.test(price);
}


async function insertOrderTemplates(req, res, next) {
    const newOrderTemplate = req.body;

    if (!validatePrice(newOrderTemplate.limitPrice)
        || !validatePrice(newOrderTemplate.stopPrice))
        return res.status(400).json('Invalid Price');

    newOrderTemplate.quantity = newOrderTemplate.quantity ? newOrderTemplate.quantity.replace(',', '.') : newOrderTemplate.quantity;

    const orderTemplate = await orderTemplatesRepository.insertOrderTemplate(newOrderTemplate);
    res.status(201).json(orderTemplate);
}

async function updateOrderTemplates(req, res, next) {
    const id = req.params.id;
    const newOrderTemplate = req.body;

    newOrderTemplate.quantity = newOrderTemplate.quantity ? newOrderTemplate.quantity.replace(',', '.') : newOrderTemplate.quantity;

    const updatedOrderTemplates = await orderTemplatesRepository.updateOrderTemplate(id, newOrderTemplate);
    res.json(updatedOrderTemplates);
}

async function deleteOrderTemplate(req, res, next) {
    const id = req.params.id;

    const actions = await actionsRepository.getByOrderTemplate(id);

    if (actions.length > 0)
        return res.status(409).json(`You can't delete an Order Template used by Automations.`);

    await orderTemplatesRepository.deleteOrderTemplate(id);
    res.sendStatus(204);
}

module.exports = {
    getOrderTemplate,
    getOrderTemplates,
    updateOrderTemplates,
    insertOrderTemplates,
    deleteOrderTemplate
}