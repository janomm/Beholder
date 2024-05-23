const Binance = require('node-binance-api');

module.exports = (settings) => {
    if (!settings) throw new Error('The settings object is required to connect on exchange.');

    const binance = new Binance({
        APIKEY: settings.accessKey,
        APISECRET: settings.secretKey,
        family: 0,
        urls: {
            base: settings.apiUrl.endsWith('/') ? settings.apiUrl : settings.apiUrl + '/',
            stream: settings.streamUrl.endsWith('/') ? settings.streamUrl : settings.streamUrl + '/'
        }
    });

    function balance() {
        return binance.balance();
    }

    function exchangeInfo() {
        return binance.exchangeInfo();
    }

    function buy(symbol, quantity, price, options) {
        if (price)
            return binance.buy(symbol, quantity, price, options);

        return binance.marketBuy(symbol, quantity);
    }

    function sell(symbol, quantity, price, options) {
        if (price)
            return binance.sell(symbol, quantity, price, options);

        return binance.marketSell(symbol, quantity);
    }

    function cancel(symbol, orderId) {
        return binance.cancel(symbol, orderId);
    }

    function orderStatus(symbol, orderId) {
        return binance.orderStatus(symbol, orderId);
    }

    async function orderTrade(symbol, orderId) {
        const trades = await binance.trades(symbol);
        return trades.find(t => t.orderId === orderId)
    }

    function miniTickerStream(callback) {
        binance.websockets.miniTicker(markets => callback(markets));
    }

    function bookStream(callback) {
        binance.websockets.bookTickers(order => callback(order))
    }

    function userDataStream(balanceCallback, executionCallback, listStatusCallback) {
        binance.websockets.userData(
            balance => balanceCallback(balance),
            executionData => executionCallback(executionData),
            subcribedData => console.log(`userDataScream:subscribed: ${subcribedData}`),
            listStatusData => listStatusCallback(listStatusData)
        );
    }

    async function chartStream(symbol, interval, callback, logs) {
        //const binance = Binance().options({ family: 0 })
        const streamUrl = binance.websockets.chart(symbol, interval, (symbol, interval, chart) => {
            const tick = binance.last(chart);
            if (tick && chart[tick].isFinal === false) return;
            const ohlc = binance.ohlc(chart);
            callback(ohlc);
        });
        if (logs) console.log(`Chart Stream connected at ${streamUrl}`)
    }

    async function terminateChartStream(symbol, interval) {
        //btcusdt@kline_1m
        const signature = `${symbol.toLowerCase()}@kline_${interval}`;
        binance.websockets.terminate(signature);
        console.log(`Chart Stream ${signature} terminated!`);
    }

    async function ticketStream(symbol, callback, logs) {
        const streamUrl = binance.websockets.prevDay(symbol, (data, converted) => {
            callback(converted)
        });
        if (logs) console.log(`Ticket Stream connected at ${streamUrl}`);
    }

    function terminateTickerStream(symbol, logs) {
        binance.websockets.terminate(`${symbol.toLowerCase()}@ticker`);
        if (logs) console.log(`Ticket Stream disconnected at ${symbol.toLowerCase()}@ticker`);
    }

    return {
        exchangeInfo,
        miniTickerStream,
        bookStream,
        userDataStream,
        balance,
        buy,
        sell,
        cancel,
        orderStatus,
        orderTrade,
        chartStream,
        terminateChartStream,
        ticketStream,
        terminateTickerStream
    };

}