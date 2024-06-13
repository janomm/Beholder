const ordersRepository = require('./repositories/ordersRepository')
const { orderStatus } = require('./repositories/ordersRepository');
const { getActiveMonitor, monitorTypes } = require('./repositories/monitorsRepository');
const { execCalc, indexKeys } = require('./utils/indexes');
const { or } = require('sequelize');

let WSS, beholder, exchange;

function startMiniTickerMonitor(broadcastLabel, logs) {
    if (!exchange) return new Error(`Exchange Monitor not initialized yet!`);

    exchange.miniTickerStream((markets) => {
        if (logs) console.log(markets);

        Object.entries(markets).map(async (mkt) => {
            delete mkt[1].volume;
            delete mkt[1].quoteVolume;
            delete mkt[1].eventTime;

            const converted = {};
            Object.entries(mkt[1]).map(props => converted[props[0]] = parseFloat(props[1]));
            const results = await beholder.updateMemory(mkt[0], indexKeys.MINI_TICKER, null, converted);
            if (results) results.map(r => WSS.broadcast({ notification: r }));
        })

        if (broadcastLabel && WSS)
            WSS.broadcast({ [broadcastLabel]: markets });

        //Simulação de Book
        const books = Object.entries(markets).map(mkt => {
            const book = { symbol: mkt[0], bestAsk: mkt[1].close, bestBid: mkt[1].close };
            const currentMemory = beholder.getMemory(mkt[0], indexKeys.BOOK);

            const newMemory = {};
            newMemory.previous = currentMemory ? currentMemory.current : book;
            newMemory.current = book;

            beholder.updateMemory(mkt[0], indexKeys.BOOK, null, newMemory)
                .then(results => {
                    if (results) results.map(r => WSS.broadcast({ notification: r }))
                })
            return book;
        })
        if (WSS) WSS.broadcast({ book: books })
        //Fim da simulação de Book
    });
    console.log(`Mini-Ticker Monitor has started at ${broadcastLabel}!`);
}

function stopChartMonitor(symbol, interval, indexes, logs) {
    if (!symbol) return new Error(`You can't stop a Chart Monitor without a symbol!`);
    if (!exchange) return new Error(`Exchange monitor not initialized yet!`);

    exchange.terminateChartStream(symbol, interval);
    if (logs) console.log(`Chart Monitor ${symbol}_${interval} Stopped!`);

    beholder.deleteMemory(symbol, 'LAST_CANDLE', interval);

    if (indexes && Array.isArray(indexes))
        indexes.map(index => beholder.deleteMemory(symbol, index, interval));
}

function stopTickerMonitor(symbol, logs) {
    if (!symbol) return new Error(`You can't stop a Ticker Monitor without a symbol!`);
    if (!exchange) return new Error(`Exchange monitor not initialized yet!`);

    exchange.terminateTickerStream(symbol);
    if (logs) console.log(`Ticker Monitor ${symbol} Stopped!`);

    beholder.deleteMemory(symbol, indexKeys.TICKER);
}

async function loadWallet() {
    if (!exchange) return new Error(`Exchange monitor not initialized yet!`);
    try {
        const info = await exchange.balance();
        const wallet = Object.entries(info).map(async (item) => {

            const results = await beholder.updateMemory(item[0], indexKeys.WALLET, null, parseFloat(item[1].available));
            if (results) results.map(r => WSS.broadcast({ notification: r }));

            return {
                symbol: item[0],
                available: item[1].available,
                onOrder: item[1].onOrder
            }
        })
        return Promise.all(wallet);
    }
    catch (err) {
        console.error(err.body ? JSON.stringify(err.body) : err.message);
    }

    return null;
}

function notifyOrderUpdate(order) {
    let type = '';
    switch (order.status) {
        case 'FILLED': type = 'success'; break;
        case 'REJECTED':
        case 'EXPIRED': type = 'error'; break;
        default: type = 'info'; break;
    }
    WSS.broadcast({ notification: { type, text: `Order #${order.orderId} was updated as ${order.status}.` } });
}

function processExecutionData(executionData, broadcastLabel) {
    if (executionData.x === orderStatus.NEW) return;//ignora as novas, pois podem ter vindo de outras fontes

    const order = {
        symbol: executionData.s,
        orderId: executionData.i,
        clientOrderId: executionData.X === orderStatus.CANCELED ? executionData.C : executionData.c,
        side: executionData.S,
        type: executionData.o,
        status: executionData.X,
        isMaker: executionData.m,
        transactTime: executionData.T
    }

    if (order.status === orderStatus.FILLED) {
        const quoteAmount = parseFloat(executionData.Z);
        order.avgPrice = quoteAmount / parseFloat(executionData.z);
        order.commission = executionData.n;

        const isQuoteCommission = executionData.N && order.symbol.endsWith(executionData.N);
        order.net = isQuoteCommission ? quoteAmount - parseFloat(order.commission) : quoteAmount;
    }

    if (order.status === orderStatus.REJECTED) order.obs = executionData.r;

    setTimeout(async () => {
        try {
            const updatedOrder = await ordersRepository.updateOrderByOrderId(order.orderId, order.clientOrderId, order)
            if (updatedOrder) {

                notifyOrderUpdate(order);

                const orderCopy = getLightOrder(updatedOrder.get({ plain: true }));

                const results = await beholder.updateMemory(updatedOrder, indexKeys.LAST_ORDER, null, orderCopy);
                if (results) results.map(r => WSS.broadcast({ notification: r }));
                if (broadcastLabel && WSS)
                    WSS.broadcast({ [broadcastLabel]: orderCopy });
            }
        }
        catch (err) {
            console.error(err);
        }
    }, 3000)
}

function startUserDataMonitor(broadcastLabel, logs) {
    if (!exchange) return new Error(`Exchange monitor not initialized yet!`);

    const [balanceBroadcast, executionBroadcast] = broadcastLabel ? broadcastLabel.split(',') : [null, null];

    loadWallet();

    exchange.userDataStream(
        balanceData => {
            if (logs) console.log(balanceData);
            const wallet = loadWallet();
            if (broadcastLabel && WSS)
                WSS.broadcast({ [balanceBroadcast]: wallet });
        },
        executionData => {
            if (logs) console.log(executionData);
            processExecutionData(executionData, executionBroadcast);
        }
    )
    console.log(`User Data Monitor has started at ${broadcastLabel}!`)
}

function processChartData(symbol, indexes, interval, ohlc, logs) {
    if (typeof indexes === 'string') indexes = indexes.split(',');
    if (!indexes || !Array.isArray(indexes) || indexes.length === 0) return false;

    return Promise.all(indexes.map(async (index) => {
        const params = index.split('_');
        const indexName = params[0];
        params.splice(0, 1);

        try {
            const calc = execCalc(indexName, ohlc, ...params);

            if (logs) console.log(`${index} calculated: ${JSON.stringify(calc.current ? calc.current : calc)}`);

            const results = await beholder.updateMemory(symbol, index, interval, calc, calc.current !== undefined);
            if (results) results.map(r => WSS.broadcast({ notification: r }));
            return results;
        }
        catch (err) {
            console.error(`Exchange Monitor => Can't calc then index ${indexName}: ${err.message}`);
            console.error(err);
            return false;
        }
    }));
}

function startChartMonitor(symbol, interval, indexes, broadcastLabel, logs) {

    if (!symbol) return new Error(`You can't start a Chart Monitor without a symbol!`);

    if (!exchange) return new Error(`Exchange monitor not initialized yet!`);

    exchange.chartStream(symbol, interval || '1m', async (ohlc) => {
        const lastCandle = {
            open: ohlc.open[ohlc.open.length - 1],
            close: ohlc.close[ohlc.close.length - 1],
            high: ohlc.high[ohlc.high.length - 1],
            low: ohlc.low[ohlc.low.length - 1],
            volume: ohlc.volume[ohlc.volume.length - 1]
        }

        if (logs) console.log(lastCandle);

        let results = await beholder.updateMemory(symbol, indexKeys.LAST_CANDLE, interval, lastCandle);
        if (results) results.map(r => WSS.broadcast({ notification: r }));

        if (broadcastLabel && WSS)
            WSS.broadcast({ [broadcastLabel]: lastCandle });

        results = await processChartData(symbol, indexes, interval, ohlc, logs);
        if (results) results.map(r => WSS.broadcast({ notification: r }));

    })

    console.log(`Chart Monitor has started at ${symbol}_${interval}!`)

}

function getLightTicker(data) {
    delete data.eventType;
    delete data.eventTime;
    delete data.symbol;
    delete data.openTime;
    delete data.closeTime;
    delete data.firstTradeId;
    delete data.lastTradeId;
    delete data.numTrade;
    delete data.quoteVolume;
    delete data.closeQty;
    delete data.bestBidQty;
    delete data.bestAskQty;
    delete data.volume;

    data.priceChange = parseFloat(data.priceChange);
    data.percentChange = parseFloat(data.percentChange);
    data.averagePrice = parseFloat(data.averagePrice);
    data.prevClose = parseFloat(data.prevClose);
    data.high = parseFloat(data.high);
    data.low = parseFloat(data.low);
    data.open = parseFloat(data.open);
    data.close = parseFloat(data.close);
    data.bestBid = parseFloat(data.bestBid);
    data.bestAsk = parseFloat(data.bestAsk);

    return data;
}

function startTickerMonitor(symbol, broadcastLabel, logs) {
    if (!symbol) return new Error(`You can't start a Ticker Monitor without a symbol!`);
    if (!exchange) return new Error(`Exchange monitor not initialized yet!`);

    exchange.ticketStream(symbol, async (data) => {
        if (logs) console.log(data);
        try {
            const ticker = getLightTicker({ ...data });
            const currentMemory = beholder.getMemory(symbol, indexKeys.TICKER);

            const newMemory = {};
            newMemory.previous = currentMemory ? currentMemory.current : ticker;
            newMemory.current = ticker;

            await beholder.updateMemory(data.symbol, indexKeys.TICKER, null, newMemory);

            if (WSS && broadcastLabel) WSS.broadcast({ [broadcastLabel]: data });

        } catch (err) {
            if (logs) console.error(err);
        }
    }, logs);

    console.log(`Ticker Monitor has started for ${symbol}`);

}

function getLightOrder(order) {
    const orderCopy = { ...order };
    delete orderCopy.id;
    delete orderCopy.automationId;
    delete orderCopy.orderId;
    delete orderCopy.clientOrderId;
    delete orderCopy.transactTime;
    delete orderCopy.isMaker;
    delete orderCopy.comission;
    delete orderCopy.obs;
    delete orderCopy.Automation;
    delete orderCopy.createdAt;
    delete orderCopy.updatedAt;
    orderCopy.limitPrice = parseFloat(orderCopy.limitPrice);
    orderCopy.stopPrice = parseFloat(orderCopy.stopPrice);
    orderCopy.avgPrice = parseFloat(orderCopy.avgPrice);
    orderCopy.netPrice = parseFloat(orderCopy.netPrice);
    orderCopy.quantity = parseFloat(orderCopy.quantity);
    orderCopy.icebergQuantity = parseFloat(orderCopy.icebergQuantity);
    return orderCopy;
}

async function init(settings, wssInstance, beholderInstance) {
    if (!settings || !beholderInstance) throw new Error(`Can't start Exchange Monitor without settings and/or Beholder.`);

    WSS = wssInstance;
    beholder = beholderInstance;
    exchange = require("./utils/exchange")(settings);

    const monitors = await getActiveMonitor();
    monitors.map(monitor => {
        setTimeout(() => {
            switch (monitor.type) {
                case monitorTypes.MINI_TICKER:
                    return startMiniTickerMonitor(monitor.broadcastLabel, monitor.logs);
                case monitorTypes.USER_DATA:
                    return startUserDataMonitor(monitor.broadcastLabel, monitor.logs);
                case monitorTypes.CANDLES:
                    return startChartMonitor(monitor.symbol,
                        monitor.interval,
                        monitor.indexes.split(','),
                        monitor.broadcastLabel,
                        monitor.logs);
                case monitorTypes.TICKER:
                    return startTickerMonitor(monitor.symbol, monitor.broadcastLabel, monitor.logs);
            }
        }, 250)
    })

    const lastOrders = await ordersRepository.getLastFilledOrders();
    lastOrders.map(async order => {
        const orderCopy = getLightOrder(order.get({ plain: true }));
        await beholder.updateMemory(order.symbol, indexKeys.LAST_ORDER, null, orderCopy, false);
    })

    console.log(`App Exchange Monitor is running!`);
}

module.exports = {
    init,
    startChartMonitor,
    stopChartMonitor,
    startTickerMonitor,
    stopTickerMonitor
}