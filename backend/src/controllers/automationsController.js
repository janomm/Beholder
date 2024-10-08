const automationsRepository = require('../repositories/automationsRepository');
const beholder = require('../beholder');
const actionsRepository = require('../repositories/actionsRepository');
const db = require('../db');

function validateConditions(conditions) {
    return /^(MEMORY\[\'.+?\'\](\..+)?[><=!]+([0-9\.\-]+|(\'.+?\')|true|false|MEMORY\[\'.+?\'\](\..+)?)( && )?)+$/ig.test(conditions);
}

async function startAutomation(req, res, next) {
    const id = req.params.id;
    const automation = await automationsRepository.getAutomation(id);
    if (automation.isActive) return res.sendStatus(204);

    automation.isActive = true;
    beholder.updateBrain(automation.get({ plain: true }));

    await automation.save();
    if (automation.logs) console.log(`Automation ${automation.name} has started!`)
    res.json(automation);
}

async function stopAutomation(req, res, next) {
    const id = req.params.id;
    const automation = await automationsRepository.getAutomation(id);
    if (!automation.isActive) return res.sendStatus(204);

    automation.isActive = false;

    beholder.deleteBrain(automation.get({ plain: true }));
    await automation.save();
    if (automation.logs) console.log(`Automation ${automation.name} has stopped!`)
    res.json(automation);
}

async function getAutomation(req, res, next) {
    const id = req.params.id;
    const automation = await automationsRepository.getAutomation(id);
    console.log(automation.get({ plain: true }))
    res.json(automation);
}

async function getAutomations(req, res, next) {
    const page = req.query.page;
    const automations = await automationsRepository.getAutomations(page);
    res.json(automations);
}

async function insertAutomation(req, res, next) {
    const newAutomation = req.body;

    if (!validateConditions(newAutomation.conditions))
        return res.status(400).json(`Invalid conditions!`);

    if (!newAutomation.actions || newAutomation.actions.length === 0)
        return res.status(400).json(`Invalid actions!`);

    const transaction = await db.transaction();

    let savedAutomation, actions;

    try {
        savedAutomation = await automationsRepository.insertAutomation(newAutomation, transaction);
        let actions = newAutomation.actions.map(a => {
            a.automationId = savedAutomation.id;
            delete a.id;
            return a;
        })

        actions = await actionsRepository.insertActions(actions, transaction);
        await transaction.commit();
    }
    catch (err) {
        await transaction.rollback();
        return res.status(500).json(err.message);
    }

    /*savedAutomation = savedAutomation.get({ plain: true });
    savedAutomation.actions = actions.map(a => a.get({ plain: true }));*/

    if (savedAutomation.isActive) {
        beholder.updateBrain(savedAutomation)
    }

    res.status(201).json(savedAutomation);
}

async function updateAutomation(req, res, next) {
    const id = req.params.id;
    const newAutomation = req.body;

    if (!validateConditions(newAutomation.conditions))
        return res.status(400).json(`Invalid conditions!`);

    if (newAutomation.actions && newAutomation.actions.length > 0) {
        const actions = newAutomation.actions.map(a => {
            a.automationId = id;
            delete a.id;
            return a;
        })

        const transaction = await db.transaction();
        try {
            await actionsRepository.deleteActions(id, transaction);
            await actionsRepository.insertActions(actions, transaction);

            await transaction.commit();
        }
        catch (err) {
            await transaction.rollback();
            return res.status(500).json(err.message);
        }
    }

    const updatedAutomation = await automationsRepository.updateAutomation(id, newAutomation);

    const plainAutomation = updatedAutomation.get({ plain: true });
    if (updateAutomation.isActive) {
        beholder.deleteBrain(plainAutomation);
        beholder.updateBrain(plainAutomation);
    } else
        beholder.deleteBrain(plainAutomation);
    res.json(updateAutomation);
}

async function deleteAutomation(req, res, next) {
    const id = req.params.id;
    const currentAutomation = await automationsRepository.getAutomation(id);

    if (currentAutomation.isActive) {
        beholder.deleteBrain(currentAutomation.get({ plain: true }));
    }

    const transaction = await db.transaction();

    try {
        await actionsRepository.deleteActions(id, transaction);
        console.log("delete 1");
        await automationsRepository.deleteAutomation(id, transaction);
        console.log("delete 2");

        await transaction.commit();
        res.sendStatus(204);
    }
    catch (err) {
        await transaction.rollback();
        return res.status(500).json(err.message);
    }

}

module.exports = {
    startAutomation,
    stopAutomation,
    getAutomation,
    getAutomations,
    insertAutomation,
    updateAutomation,
    deleteAutomation
}
