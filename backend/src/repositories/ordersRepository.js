const orderModel = require('../models/orderModel');
const Sequelize = require('sequelize');

const PAGE_SIZE = 10;

function getOrders(symbol, page = 1) {
    const options = {
        where: {},
        order: [['updatedAt', 'DESC']],
        limit: PAGE_SIZE,
        offset: PAGE_SIZE * (page - 1)
    }

    if (symbol) {
        if (symbol.length < 6) {
            options.where = { symbol: { [Sequelize.Op.like]: `%${symbol}%` } }
        } else {
            options.where = { symbol }

        }
    }

    return orderModel.findAndCountAll(options);
}

function insetOrder(newOrder) {
    return orderModel.create(newOrder);
}

function getOrderById(id) {
    return orderModel.findByPk(id);
}

function getOrder(orderId, clientOrderId) {
    return orderModel.findOne({ where: { orderId, clientOrderId } });
}

async function updateOrderById(id, newOrder) {
    const order = await getOrderById(id);
    return updateOrder(order, newOrder);
}

async function updateOrderByOrderId(orderId, clientOrderId, newOrder) {
    const order = await getOrder(orderId, clientOrderId);
    return updateOrder(order, newOrder);
}

/*async function updateOrder(currentOrder, newOrder) {
    if (newOrder.status && newOrder.status !== currentOrder.status)
        currentOrder.status = newOrder.status;

    if (newOrder.avgPrice && newOrder.avgPrice !== currentOrder.avgPrice)
        currentOrder.avgPrice = newOrder.avgPrice;

    if (newOrder.obs && newOrder.obs !== currentOrder.obs)
        currentOrder.obs = newOrder.obs;

    if (newOrder.transactTime && newOrder.transactTime !== currentOrder.transactTime)
        currentOrder.transactTime = newOrder.transactTime;

    if (newOrder.comission && newOrder.comission !== currentOrder.comission)
        currentOrder.comission = newOrder.comission;

    if (newOrder.net && newOrder.net !== currentOrder.net)
        currentOrder.net = newOrder.net;

    if (newOrder.isMaker !== null && newOrder.isMaker !== undefined &&
        newOrder.isMaker && newOrder.isMaker !== currentOrder.isMaker)
        currentOrder.isMaker = newOrder.isMaker;

    await currentOrder.save();
    return currentOrder;
}*/

async function updateOrder(currentOrder, newOrder) {
    if (!currentOrder || !newOrder) return false;

    if (newOrder.status &&
        newOrder.status !== currentOrder.status &&
        (currentOrder.status === 'NEW' || currentOrder.status === 'PARTIALLY_FILLED'))
        currentOrder.status = newOrder.status;//somente dá para atualizar ordens não finalizadas

    if (newOrder.avgPrice && newOrder.avgPrice !== currentOrder.avgPrice)
        currentOrder.avgPrice = newOrder.avgPrice;

    if (newOrder.isMaker !== null && newOrder.isMaker !== undefined && newOrder.isMaker !== currentOrder.isMaker)
        currentOrder.isMaker = newOrder.isMaker;

    if (newOrder.obs && newOrder.obs !== currentOrder.obs)
        currentOrder.obs = newOrder.obs;

    if (newOrder.transactTime && newOrder.transactTime !== currentOrder.transactTime)
        currentOrder.transactTime = newOrder.transactTime;

    if (newOrder.commission && newOrder.commission !== currentOrder.commission)
        currentOrder.commission = newOrder.commission;

    if (newOrder.net && newOrder.net !== currentOrder.net)
        currentOrder.net = newOrder.net;

    await currentOrder.save();
    return currentOrder;
}

module.exports = {
    insetOrder,
    getOrderById,
    getOrder,
    updateOrderById,
    updateOrderByOrderId,
    updateOrder,
    getOrders
}