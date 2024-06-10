const { getDefaultSettings } = require('./repositories/settingsRepository');
const { actionsType } = require('./repositories/actionsRepository')

const MEMORY = {};

let BRAIN = {};
let BRAIN_INDEX = {};

let LOCK_MEMORY = false;
let LOCK_BRAIN = false;

const INTERVAL = parseInt(process.env.AUTOMATION_INTERVAL || 0);

const LOGS = process.env.BEHOLDER_LOGS === 'true';

function init(automations) {
    try {
        LOCK_MEMORY = true;
        LOCK_BRAIN = true;

        BRAIN = {};
        BRAIN_INDEX = {};

        automations.map(auto => updateBrain(auto));

    }
    finally {
        LOCK_MEMORY = false;
        LOCK_BRAIN = false;
        console.log('Beholder Brain has started!');
    }
}

function updateBrain(automation) {
    if (!automation.isActive || !automation.conditions) return;
    BRAIN[automation.id] = automation;
    automation.indexes.split(',').map(ix => updateBrainIndex(ix, automation.id));
}

function updateBrainIndex(index, automationId) {
    if (!BRAIN_INDEX[index]) BRAIN_INDEX[index] = [];
    BRAIN_INDEX[index].push(automationId);
}

function findAutomations(memoryKey) {
    const ids = BRAIN_INDEX[memoryKey];
    if (!ids) return [];
    return ids.map(id => BRAIN[id]);
};

async function updateMemory(symbol, index, interval, value, executeAutomations = true) {

    if (LOCK_MEMORY) return false;

    const indexKey = interval ? `${index}_${interval}` : index;
    const memoryKey = `${symbol}:${indexKey}`;
    MEMORY[memoryKey] = value;

    if (LOGS) console.log(`Beholder memory updated: ${memoryKey} => ${JSON.stringify(value)}`);

    if (LOCK_BRAIN) {
        if (LOGS) console.log(`Beholder brain is locked, sorry!`)
        return false;
    }

    if (!executeAutomations) return false;

    try {
        const automations = findAutomations(memoryKey);
        if (automations && automations.length > 0 && !LOCK_BRAIN) {
            LOCK_BRAIN = true;

            const promises = automations.map((auto) => {
                return evalDecision(auto);
            })

            let results = await Promise.all(promises);

            results = results.flat().filter(r => r);

            if (!results || !results.length)
                return false;
            else
                return results;
        }
    }
    finally {
        setTimeout(() => {
            LOCK_BRAIN = false;
        }, INTERVAL)

    }
}

function invertConditions(conditions) {
    const conds = conditions.split(' && ');
    return conds.map(c => {
        if (c.indexOf('current') !== -1) {
            if (c.indexOf('>') != -1) return c.replace('>', '<').replace('current', 'previous');
            if (c.indexOf('<') != -1) return c.replace('<', '>').replace('current', 'previous');
            if (c.indexOf('!') != -1) return c.replace('!', '').replace('current', 'previous');
            if (c.indexOf('==') != -1) return c.replace('==', '!==').replace('current', 'previous');
        }
    })
        .filter(c => c)
        .join(' && ');
}

async function sendMail(settings, automation) {
    await require('./utils/email')(settings, `${automation.name} has fired! ${automation.conditions}`);
    if (automation.logs) {
        console.log(`E-mail sent from automation ${automation.name}!`)
        return { type: 'sucess', text: 'Order placed!' }
    }

}

function doAction(settings, action, automation) {
    //console.log("doAction: " + action.type === actionsType.ALERT_EMAIL);
    try {
        switch (action.type) {
            case actionsType.ORDER: return sendMail(settings, automation)
            case actionsType.ALERT_EMAIL: return { type: 'sucess', text: 'Email sent!' }
            case actionsType.ALERT_SMS: return { type: 'sucess', text: 'SMS sent!' }
        }
    }
    catch (err) {
        if (automation.logs) {
            console.error(`${automation.name}:${action.type}`);
            console.error(err);
        }
        return { type: 'error', text: `Error at ${automation.name}:${err.message}` }
    }
}

async function evalDecision(automation) {
    const indexes = automation.indexes.split(',');
    const isCheked = indexes.every(ix => MEMORY[ix] !== null && MEMORY[ix] !== undefined);
    if (!isCheked) return false;

    const invertedConditions = invertConditions(automation.conditions);
    const isValid = eval(automation.conditions + (invertedConditions ? ' && ' + invertedConditions : ''));
    if (!isValid) return false;

    if (LOGS) console.log(`Beholder evaluated a condition at automation: ${automation.name}`);

    if (!automation.actions) {
        if (LOGS) console.log(`No actions defined for automation ${automation.name}`);
        return false;
    }

    const settings = await getDefaultSettings();
    let results = automation.actions.map(action => {
        return doAction(settings, action.dataValues, automation);
    })

    results = await Promise.all(results);

    if (automation.logs)
        console.log(`Automation ${automation.name} has fired!`);
    return { text: 'Executeia Ação', type: 'success' }
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

function deleteBrainIndex(indexes, automationId) {
    if (typeof indexes === 'string') indexes = indexes.split(',');
    indexes.forEach(ix => {
        if (!BRAIN_INDEX[ix] || BRAIN_INDEX[ix].length === 0) return;
        const pos = BRAIN_INDEX[ix].findIndex(id => id === automationId);
        BRAIN_INDEX[ix].splice(pos, 1);
    });
}

function deleteBrain(automation) {
    try {
        LOCK_BRAIN = true;
        delete BRAIN[automation.id];
        deleteBrainIndex(automation.indexes.split(','), automation.id);
    }
    finally {
        LOCK_BRAIN = false;

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

function flattenObject(ob) {
    let toReturn = {};

    for (let i in ob) {
        if (!ob.hasOwnProperty(i)) continue;

        if ((typeof ob[i]) === 'object' && ob[i] !== null) {
            let flatObject = flattenObject(ob[i]);
            for (let x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;
                toReturn[i + '.' + x] = flatObject[x];
            }
        }
        else {
            toReturn[i] = ob[i];
        }
    }

    return toReturn;
}
function getEval(prop) {
    if (prop.indexOf('.') === -1) return `MEMORY['${prop}']`;

    const propSplit = prop.split('.');
    const memKey = propSplit[0];
    const memProp = prop.replace(memKey, '');
    return `MEMORY['${memKey}']${memProp}`;

}

function getMemoryIndexes() {
    const arr = Object.entries(flattenObject(MEMORY)).map(prop => {
        const propSplit = prop[0].split(":")
        return {
            symbol: propSplit[0],
            variable: propSplit[1],
            eval: getEval(prop[0]),
            example: prop[1]
        }
    }).sort((a, b) => {
        if (a.variable < b.variable) return -1;
        if (a.variable > b.variable) return 1;
        return 0;
    })

    //console.log(arr);
    return arr;
}

function getBrain() {
    return { ...BRAIN }
}

function getBrainIndexes() {
    return { ...BRAIN_INDEX }
}

module.exports = {
    updateMemory,
    getMemory,
    getBrain,
    init,
    deleteMemory,
    getMemoryIndexes,
    getBrainIndexes,
    updateBrain,
    deleteBrain
}
