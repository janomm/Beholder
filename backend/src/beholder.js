const MEMORY = {};

let BRAIN = {};

const LOGS = process.env.BEHOLDER_LOGS === 'true';

function init(automations) {
    //carregar o BRAIN
}

function updateMemory(symbol, index, interval, value) {
    //symbol:index_interval
    //BTCUSD:RSI_1m
    //BTC:WALLET
    const indexKey = interval ? `${index}_${interval}` : index;
    const memoryKey = `${symbol}:${indexKey}`;
    MEMORY[memoryKey] = value;

    if (LOGS) console.log(`Beholder memory updated: ${memoryKey} => ${JSON.stringify(value)}`);

    if (memoryKey === 'BTCBRL:LAST_CANDLE_1m') {
        /*if (MEMORY[memoryKey].current > 70)
            console.log('ENTROU NA CONDICAO');
        else
            console.log('NAO ENTROU NA CONDICAO');*/
    }

}

function getMemory() {
    return { ...MEMORY }
}

function getBrain() {
    return { ...BRAIN }
}

module.exports = {
    updateMemory,
    getMemory,
    getBrain,
    init
}
