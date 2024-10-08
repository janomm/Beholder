const actionModel = require('../models/actionModel');

const actionsType = {
    ALERT_EMAIL: 'ALERT_EMAIL',
    ALERT_SMS: 'ALERT_SMS',
    ORDER: 'ORDER'
}

function insertActions(actions, transaction) {
    return actionModel.bulkCreate(actions, { transaction });
}

function deleteActions(automationId, transaction) {
    return actionModel.destroy({
        where: { automationId },
        transaction
    })
}

function getByOrderTemplate(orderTemplateId) {
    return actionModel.findAll({ where: { orderTemplateId } });
}

module.exports = {
    actionsType,
    insertActions,
    deleteActions,
    getByOrderTemplate
}