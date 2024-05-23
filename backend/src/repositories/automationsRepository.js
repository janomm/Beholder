const automationModal = require('../models/automationModel');
const Sequelize = require('sequelize');

function getActiveAutomations() {
    return automationModal.findAll({ where: { isActive: true } });
}

function getAutomation(id) {
    return automationModal.findByPk(id);
}

function getAutomations(page = 1) {
    return automationModal.findAndCountAll({
        where: {},
        order: [['isActive', 'DESC'], ['symbol', 'ASC'], ['name', 'ASC']],
        limit: 10,
        offset: 10 * (page - 1)
    })
}

function insertAutomation(newAutomation) {
    return automationModal.create(newAutomation);
}

function deleteAutomation(id) {
    return automationModal.destroy({ where: { id } });
}

async function updateAutomation(id, newAutomation) {
    const currentAutomation = await getAutomation(id);

    if (newAutomation.symbol && newAutomation.symbol !== currentAutomation.symbol)
        currentAutomation.symbol = newAutomation.symbol;

    if (newAutomation.name && newAutomation.name !== currentAutomation.name)
        currentAutomation.name = newAutomation.name;

    if (newAutomation.indexes && newAutomation.indexes !== currentAutomation.indexes)
        currentAutomation.indexes = newAutomation.indexes;

    if (newAutomation.indexes && newAutomation.indexes !== currentAutomation.indexes)
        currentAutomation.indexes = newAutomation.indexes;

    if (newAutomation.conditions && newAutomation.conditions !== currentAutomation.conditions)
        currentAutomation.conditions = newAutomation.conditions;

    if (newAutomation.isActive !== null && newAutomation.isActive !== undefined
        && newAutomation.isActive !== currentAutomation.isActive)
        currentAutomation.isActive = newAutomation.isActive;

    if (newAutomation.logs !== null && newAutomation.logs !== undefined
        && newAutomation.logs !== currentAutomation.logs)
        currentAutomation.logs = newAutomation.logs;


    await currentAutomation.save();
    return currentAutomation;
}

module.exports = {
    getActiveAutomations,
    getAutomation,
    getAutomations,
    insertAutomation,
    deleteAutomation,
    updateAutomation
}