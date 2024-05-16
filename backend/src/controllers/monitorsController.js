const monitorsRepository = require('../repositories/monitorsRepository');
const appEm = require('../app-em');

const START_MONITOR = 'START';
const STOP_MONITOR = 'STOP';

function startStopMonitor(monitor, acao) {
    const indexes = monitor.indexes ? monitor.indexes.split(',') : [];

    switch (acao) {
        case START_MONITOR: {
            return appEm.startChartMonitor(monitor.symbol, monitor.interval, indexes, monitor.broadcastLabel, monitor.logs);
        }
        case STOP_MONITOR: {
            return appEm.stopChartMonitor(monitor.symbol, monitor.interval, indexes, monitor.broadcastLabel, monitor.logs);
        }
        default: return;
    }
}

function startStreamMonitor(monitor) {
    switch (monitor.type) {
        case monitorsRepository.monitorTypes.CANDLES: {
            return startStopMonitor(monitor, START_MONITOR);
            break;
        }
        case monitorsRepository.monitorTypes.TICKER: {
            return appEm.startTicketMonitor(monitor.symbol, monitor.broadcastLabel, monitor.logs);
            break;
        }
    }
}

function stopStreamMonitor(monitor) {
    switch (monitor.type) {
        case monitorsRepository.monitorTypes.CANDLES: {
            return startStopMonitor(monitor, STOP_MONITOR);
            break;
        }
        case monitorsRepository.monitorTypes.TICKER: {
            return appEm.stopTickerMonitor(monitor.symbol, monitor.logs);
            break;
        }
    }
}

async function startMonitor(req, res, next) {
    const id = req.params.id;
    const monitor = await monitorsRepository.getMonitor(id);
    if (monitor.isActive) return res.sendStatus(204);
    if (monitor.isSystemMon) return res.sendStatus(403).send(`You can't start or stop then system monitors.`);

    startStreamMonitor(monitor);

    monitor.isActive = true;
    await monitor.save();
    res.json(monitor);
}

async function stopMonitor(req, res, next) {
    const id = req.params.id;
    const monitor = await monitorsRepository.getMonitor(id);
    if (!monitor.isActive) return res.sendStatus(204);
    if (monitor.isSystemMon) return res.sendStatus(403).send(`You can't start or stop then system monitors.`);

    //Testar os tipos aqui
    stopStreamMonitor(monitor);

    monitor.isActive = false;
    await monitor.save();
    res.json(monitor);
}

async function getMonitor(req, res, next) {
    const id = req.params.id;
    const monitor = await monitorsRepository.getMonitor(id);
    res.json(monitor);
}

async function getMonitors(req, res, next) {
    const page = req.query.page;
    const monitors = await monitorsRepository.getMonitors(page);
    res.json(monitors);
}

function validateMonitor(newMonitor) {
    if (newMonitor.type !== monitorsRepository.monitorTypes.CANDLES) {
        newMonitor.interval = null;
        newMonitor.indexes = null;

        if (newMonitor.type !== monitorsRepository.monitorTypes.TICKER)
            newMonitor.symbol = '*';
    }
}

async function insertMonitor(req, res, next) {
    const newMonitor = req.body;
    const savedMonitor = await monitorsRepository.insertMonitor(newMonitor);

    if (savedMonitor.isActive) {
        startStreamMonitor(savedMonitor);
    }

    res.status(201).json(savedMonitor.get({ plain: true }));
}

async function updateMonitor(req, res, next) {
    const id = req.params.id;
    const newMonitor = req.body;

    const currentMonitor = await monitorsRepository.getMonitor(id);
    if (currentMonitor.isSystemMon) return res.sendStatus(403);

    const updatedMonitor = await monitorsRepository.updatedMonitor(id, newMonitor);

    stopStreamMonitor(currentMonitor);

    if (updatedMonitor.isActive) {
        startStreamMonitor(updateMonitor);
    }

    res.json(updatedMonitor);
}

async function deleteMonitor(req, res, next) {
    const id = req.params.id;
    const currentMonitor = await monitorsRepository.getMonitor(id);
    if (currentMonitor.isSystemMon) return res.sendStatus(403);

    if (currentMonitor.isActive) stopStreamMonitor(currentMonitor);

    await monitorsRepository.deleteMonitor(id);

    res.sendStatus(204);
}

module.exports = {
    getMonitor,
    getMonitors,
    insertMonitor,
    updateMonitor,
    deleteMonitor,
    startMonitor,
    stopMonitor
}
