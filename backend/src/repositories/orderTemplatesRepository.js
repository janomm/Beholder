const orderTemplateModel = require('../models/orderTemplateModel');
const Sequelize = require('sequelize');

function insertOrderTemplate(newOrderTemplate) {
    return orderTemplateModel.create(newOrderTemplate)
}

function deleteOrderTemplate(id) {
    return orderTemplateModel.destroy({ where: { id } });
}

function getOrderTemplates(symbol, page = 1) {
    const options = {
        where: {},
        order: [['symbol', 'ASC'], ['name', 'ASC']],
        limit: 10,
        offset: 10 * (page - 1)
    }

    if (symbol) {
        if (symbol.length < 6)
            options.where = { symbol: { [Sequelize.Op.like]: `%${symbol}%` } };
        else
            options.where = { symbol };
    }

    return orderTemplateModel.findAndCountAll(options)
}

function getOrderTemplate(id) {
    return orderTemplateModel.findOne({ where: { id } });
}

async function updateOrderTemplate(id, newOrderTemplate) {
    const currentOrderTemplate = await getOrderTemplate(id);

    if (newOrderTemplate.name && currentOrderTemplate.name !== newOrderTemplate.name) {
        currentOrderTemplate.name = newOrderTemplate.name;
    }

    if (newOrderTemplate.type && currentOrderTemplate.type !== newOrderTemplate.type) {
        currentOrderTemplate.type = newOrderTemplate.type;
    }

    if (newOrderTemplate.side && currentOrderTemplate.side !== newOrderTemplate.side) {
        currentOrderTemplate.side = newOrderTemplate.side;
    }

    if (newOrderTemplate.limitPrice && currentOrderTemplate.limitPrice !== newOrderTemplate.limitPrice) {
        currentOrderTemplate.limitPrice = newOrderTemplate.limitPrice;
    }

    if (newOrderTemplate.limitPriceMultiplier && currentOrderTemplate.limitPriceMultiplier !== newOrderTemplate.limitPriceMultiplier) {
        currentOrderTemplate.limitPriceMultiplier = newOrderTemplate.limitPriceMultiplier;
    }

    if (newOrderTemplate.stopPrice && currentOrderTemplate.stopPrice !== newOrderTemplate.stopPrice) {
        currentOrderTemplate.stopPrice = newOrderTemplate.stopPrice;
    }

    if (newOrderTemplate.stopPriceMultiplier && currentOrderTemplate.stopPriceMultiplier !== newOrderTemplate.stopPriceMultiplier) {
        currentOrderTemplate.stopPriceMultiplier = newOrderTemplate.stopPriceMultiplier;
    }

    if (newOrderTemplate.quantity && currentOrderTemplate.quantity !== newOrderTemplate.quantity) {
        currentOrderTemplate.quantity = newOrderTemplate.quantity;
    }

    if (newOrderTemplate.quantityMultiplier && currentOrderTemplate.quantityMultiplier !== newOrderTemplate.quantityMultiplier) {
        currentOrderTemplate.quantityMultiplier = newOrderTemplate.quantityMultiplier;
    }

    if (newOrderTemplate.icebergQty && currentOrderTemplate.icebergQty !== newOrderTemplate.icebergQty) {
        currentOrderTemplate.icebergQty = newOrderTemplate.icebergQty;
    }

    if (newOrderTemplate.icebergQtyMultiplier && currentOrderTemplate.icebergQtyMultiplier !== newOrderTemplate.icebergQtyMultiplier) {
        currentOrderTemplate.icebergQtyMultiplier = newOrderTemplate.icebergQtyMultiplier;
    }

    await currentOrderTemplate.save();
    return currentOrderTemplate;

}

module.exports = {
    insertOrderTemplate,
    deleteOrderTemplate,
    getOrderTemplates,
    getOrderTemplate,
    updateOrderTemplate
}
