const symbolModel = require("../models/symbolModel");
const Sequelize = require('sequelize');

function getSymbols() {
    return symbolModel.findAll();
}

function searchSymbols(search, onlyFavorites = false, page = 1) {
    const options = {
        where: {},
        order: [['symbol', 'ASC']],
        limit: 10,
        offset: 10 * (page - 1)
    }
    if (search) {
        if (search.length < 6)
            options.where = { symbol: { [Sequelize.Op.like]: `%${search}%` } };
        else
            options.where = { symbol: search };
    }

    if (onlyFavorites) options.where.isFavorite = true;

    return symbolModel.findAndCountAll(options);
}

function getSymbol(symbol) {
    return symbolModel.findOne({ where: { symbol } })
}

async function updateSymbol(symbol, newSymbol) {
    const currentSymbol = await getSymbol(symbol);

    if (newSymbol.basePrecision && currentSymbol.basePrecision !== newSymbol.basePrecision) {
        currentSymbol.basePrecision = newSymbol.basePrecision;
    }

    if (newSymbol.quotePrecision && currentSymbol.quotePrecision !== newSymbol.quotePrecision) {
        currentSymbol.quotePrecision = newSymbol.quotePrecision;
    }

    if (newSymbol.minNotional && currentSymbol.minNotional !== newSymbol.minNotional) {
        currentSymbol.minNotional = newSymbol.minNotional;
    }

    if (newSymbol.minLotSize && currentSymbol.minLotSize !== newSymbol.minLotSize) {
        currentSymbol.minLotSize = newSymbol.minLotSize;
    }

    if (newSymbol.isFavorite !== null && newSymbol.isFavorite !== undefined
        && currentSymbol.isFavorite !== newSymbol.isFavorite) {
        currentSymbol.isFavorite = newSymbol.isFavorite;
    }

    if (newSymbol.base && currentSymbol.base !== newSymbol.base) {
        currentSymbol.base = newSymbol.base;
    }

    if (newSymbol.quote && currentSymbol.quote !== newSymbol.quote) {
        currentSymbol.quote = newSymbol.quote;
    }

    await currentSymbol.save();
}

async function deleteAll() {
    return symbolModel.destroy({ truncate: true });
}

async function bulkInsert(symbols) {
    return symbolModel.bulkCreate(symbols);
}

module.exports = {
    getSymbols,
    getSymbol,
    updateSymbol,
    deleteAll,
    bulkInsert,
    searchSymbols
}