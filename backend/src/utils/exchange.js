const Binance = require('node-binance-api');

module.exports = (settings) => {
    if (!settings) throw new Error('The settings object is required to connect on exchange.');

    const binance = new Binance({
        API_KEY: settings.accessKey,
        API_SECRET: settings.secretKey,
        family: 0,
        urls: {
            base: settings.apiUrl.endsWith('/') ? settings.apiUrl : settings.apiUrl + '/'
        }
    });

    function exchangeInfo() {
        return binance.exchangeInfo();
    }

    return { exchangeInfo };

}