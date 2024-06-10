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

    if (currentSettings.phone && currentSettings.phone !== newSettings.phone) {
        currentSettings.phone = newSettings.phone;
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

    if (currentSettings.sendGridKey && currentSettings.sendGridKey !== newSettings.sendGridKey) {
        currentSettings.sendGridKey = newSettings.sendGridKey;
    }

    if (currentSettings.twilioSid && currentSettings.twilioSid !== newSettings.twilioSid) {
        currentSettings.twilioSid = newSettings.twilioSid;
    }

    if (currentSettings.twilioToken && currentSettings.twilioToken !== newSettings.twilioToken) {
        currentSettings.twilioToken = newSettings.twilioToken;
    }

    if (currentSettings.twilioPhone && currentSettings.twilioPhone !== newSettings.twilioPhone) {
        currentSettings.twilioPhone = newSettings.twilioPhone;
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