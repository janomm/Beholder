const settingsModel = require("../models/settingsModel");
const bcrypt = require('bcryptjs');
const crypto = require('../utils/crypto');

const settingsCache = {};

function getSettingsByEmail(email) {
    return settingsModel.findOne({ where: { email } });
}

function getSettingsById(id) {
    return settingsModel.findOne({ where: { id } })
}

async function getDecryptedSettings(id) {
    let settings = settingsCache[id];

    if (!settings) {
        settings = await getSettingsById(id);
        settings.secretKey = crypto.decrypt(settings.secretKey);
        settingsCache[id] = settings;
    }

    return settings;
}

function clearSettingsCache(id) {
    settingsCache[id] = null;
}

async function getDefaultSettings() {
    const settings = await settingsModel.findOne();
    return getDecryptedSettings(settings.id);
}

async function updateSettings(id, newSettings) {
    const currentSettings = await getSettingsById(id);

    if (newSettings.email && currentSettings.email !== newSettings.email) {
        currentSettings.email = newSettings.email;
    }

    if (newSettings.password) {
        currentSettings.password = bcrypt.hashSync(newSettings.password);
    }

    if (currentSettings.apiUrl && currentSettings.apiUrl !== newSettings.apiUrl) {
        currentSettings.apiUrl = newSettings.apiUrl;
    }

    if (currentSettings.streamUrl && currentSettings.streamUrl !== newSettings.streamUrl) {
        currentSettings.streamUrl = newSettings.streamUrl;
    }

    if (currentSettings.accesKey && currentSettings.accesKey !== newSettings.accesKey) {
        currentSettings.accesKey = newSettings.accesKey;
    }

    if (newSettings.secretKey) {
        currentSettings.secretKey = crypto.encrypt(newSettings.secretKey);
        clearSettingsCache(id);
    }

    await currentSettings.save();
}

module.exports = {
    getSettingsByEmail,
    getSettingsById,
    updateSettings,
    getDecryptedSettings,
    getDefaultSettings
}