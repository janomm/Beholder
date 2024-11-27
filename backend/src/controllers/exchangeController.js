const settingsRepository = require('../repositories/settingsRepository');
const beholder = require('../beholder');

const EMPTY_OBJ = {};

async function getBalance(req, res, next) {
    const id = res.locals.token.id;
    const settings = await settingsRepository.getDecryptedSettings(id);
    const exchange = require('../utils/exchange')(settings);
    const info = await exchange.balance();

    const usd = Object.entries(info)
        .map(prop => {
            let available = parseFloat(prop[1].available);
            if (available > 0) available = beholder.tryUSDConversion(prop[0], available);

            let onOrder = parseFloat(prop[1].onOrder);
            if (onOrder > 0) onOrder = beholder.tryUSDConversion(prop[0], onOrder);

            return available + onOrder;
        })
        .reduce((prev, curr) => prev + curr);

    info.usdEstimate = usd.toFixed(2);

    
    res.json(info);

}

module.exports = {
    getBalance
}