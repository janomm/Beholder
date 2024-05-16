const MEMORY = {};

let BRAIN = {};

let LOCK_MEMORY = false;
let LOCK_BRAIN = false;

const LOGS = process.env.BEHOLDER_LOGS === 'true';

function init(automations) {
    //carregar o BRAIN
}

function updateMemory(symbol, index, interval, value) {
    if (LOCK_MEMORY) return;
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

function deleteMemory(symbol, index, interval) {

    //SYMBOL:INDEX_INTERVAL - formato
    try {
        const indexKey = interval ? `${index}_${interval}` : index;
        const memoryKey = `${symbol}:${indexKey}`;

        LOCK_MEMORY = true;
        delete MEMORY[memoryKey];
        if (LOGS) console.log(`Beholder memory delete: ${memoryKey}`);
    }
    finally {
        LOCK_MEMORY = false;
    }
}

function getMemory(symbol, index, interval) {
    if (symbol && index) {
        const indexKey = interval ? `${index}_${interval}` : index;
        const memoryKey = `${symbol}:${indexKey}`;

        const result = MEMORY[memoryKey];
        return typeof result === 'object' ? { ...result } : result;
    }
    return { ...MEMORY }
}

function getBrain() {
    return { ...BRAIN }
}

module.exports = {
    updateMemory,
    getMemory,
    getBrain,
    init,
    deleteMemory
}
