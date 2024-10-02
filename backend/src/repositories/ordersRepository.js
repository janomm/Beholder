const orderModel = require('../models/orderModel');
const Sequelize = require('sequelize');
const automationModel = require('../models/automationModel');

const PAGE_SIZE = 10;

const orderStatus = {
    FILLED: 'FILLED',
    PARTIALLY_FILLED: 'PARTIALLY_FILLED',
    CANCELED: 'CANCELED',
    REJECTED: 'REJECTED',
    NEW: 'NEW'
}

const STOP_TYPES = ["STOP_LOSS", "STOP_LOSS_LIMIT", "TAKE_PROFIT", "TAKE_PROFIT_LIMIT"];
const LIMIT_TYPES = ["LIMIT", "STOP_LOSS_LIMIT", "TAKE_PROFIT_LIMIT"];

function getReportOrders(quoteAsset, startDate, endDate) {
    startDate = startDate ? startDate : 0;
    endDate = endDate ? endDate : Date.now();
    return orderModel.findAll({
        where: {
            symbol: { [Sequelize.Op.like]: `%${quoteAsset}` },
            transactTime: { [Sequelize.Op.between]: [startDate, endDate] },
            status: 'FILLED',
            net: { [Sequelize.Op.gt]: 0 }
        },
        order: [['transactTime', 'ASC']],
        include: automationModel,
        raw: true
    })
}

function insertOrder(newOrder) {
    return orderModel.create(newOrder);
}

function getOrders(symbol, page = 1) {
    const options = {
        where: {},
        order: [['updatedAt', 'DESC']],
        limit: PAGE_SIZE,
        offset: PAGE_SIZE * (page - 1),
        distinct: true
    }

    if (symbol) {
        if (symbol.length < 6) {
            options.where = { symbol: { [Sequelize.Op.like]: `%${symbol}%` } }
        } else {
            options.where = { symbol }

        }
    }

    options.include = automationModel;

    return orderModel.findAndCountAll(options);
}

function getOrderById(id) {
    return orderModel.findByPk(id);
}

function getOrder(orderId, clientOrderId) {
    return orderModel.findOne({ where: { orderId, clientOrderId }, iclude: automationModel });
}

async function updateOrderById(id, newOrder) {
    const order = await getOrderById(id);
    if (!order) return false;
    return updateOrder(order, newOrder);
}

async function updateOrderByOrderId(orderId, clientOrderId, newOrder) {
    const order = await getOrder(orderId, clientOrderId);
    if (!order) return false;
    return updateOrder(order, newOrder);
}

async function getLastFilledOrders() {
    const idObjects = await orderModel.findAll({
        where: { status: 'FILLED' },
        group: 'symbol',
        attributes: [Sequelize.fn('max', Sequelize.col('id'))],
        raw: true
    });
    const ids = idObjects.map(o => Object.values(o)).flat();

    return orderModel.findAll({ where: { id: ids } })
}

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
    insertOrder,
    getOrderById,
    getOrder,
    updateOrderById,
    updateOrderByOrderId,
    updateOrder,
    getOrders,
    orderStatus,
    getLastFilledOrders,
    STOP_TYPES,
    LIMIT_TYPES,
    getReportOrders
}