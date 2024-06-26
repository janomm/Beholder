const monitorModel = require('../models/monitorModel');

const monitorTypes = {
    MINI_TICKER: 'MINI_TICKER',
    BOOK: 'BOOK',
    USER_DATA: 'USER_DATA',
    CANDLES: 'CANDLES',
    TICKER: 'TICKER'
}

async function monitorExists(type, symbol, interval) {
    const count = await monitorModel.count({ where: { type, symbol, interval } });
    return count > 0;
}

async function insertMonitor(newMonitor) {
    const alreadyExists = await monitorExists(newMonitor.type, newMonitor.symbol, newMonitor.interval);
    if (alreadyExists) throw new Error(`Already exists a monitor with this params.`);

    return monitorModel.create(newMonitor);
}

function deleteMonitor(id) {
    return monitorModel.destroy({ where: { id, isSystemMon: false } })
}

function getMonitor(id) {
    return monitorModel.findByPk(id);
}

function getActiveMonitor() {
    return monitorModel.findAll({ where: { isActive: true } });
}

function getMonitors(page = 1) {
    return monitorModel.findAndCountAll({
        where: {},
        order: [['isActive', 'DESC'], ['isSystemMon', 'DESC'], ['symbol', 'ASC']],
        limit: 10,
        offset: 10 * (page - 1)
    })
}

async function updatedMonitor(id, newMonitor) {
    const currentMonitor = await getMonitor(id);

    if (newMonitor.symbol && newMonitor.symbol !== currentMonitor.symbol)
        currentMonitor.symbol = newMonitor.symbol;

    if (newMonitor.type && newMonitor.type !== currentMonitor.type)
        currentMonitor.type = newMonitor.type;

    if (currentMonitor.type === monitorTypes.CANDLES) {
        if (newMonitor.interval && newMonitor.interval !== currentMonitor.interval)
            currentMonitor.interval = newMonitor.interval;
    } else {
        currentMonitor.interval = null;
    }

    if (newMonitor.broadcastLabel && newMonitor.broadcastLabel !== currentMonitor.broadcastLabel)
        currentMonitor.broadcastLabel = newMonitor.broadcastLabel.trim().length !== 0 ? newMonitor.broadcastLabel : "";;

    if (newMonitor.indexes !== currentMonitor.indexes)
        currentMonitor.indexes = newMonitor.indexes;

    if (newMonitor.isActive !== null && newMonitor.isActive !== undefined
        && newMonitor.isActive !== currentMonitor.isActive)
        currentMonitor.isActive = newMonitor.isActive;

    if (newMonitor.isSystemMon !== null && newMonitor.isSystemMon !== undefined
        && newMonitor.isSystemMon !== currentMonitor.isSystemMon)
        currentMonitor.isSystemMon = newMonitor.isSystemMon;

    if (newMonitor.logs !== null && newMonitor.logs !== undefined
        && newMonitor.logs !== currentMonitor.logs)
        currentMonitor.logs = newMonitor.logs;

    await currentMonitor.save();
    return currentMonitor;

}

module.exports = {
    monitorTypes,
    insertMonitor,
    deleteMonitor,
    getMonitor,
    getActiveMonitor,
    getMonitors,
    updatedMonitor
}
