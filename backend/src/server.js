const database = require("./db");
const app = require('./app');
const appWs = require('./app-ws');
const settingsRepository = require('./repositories/settingsRepository');
const appEm = require('./app-em');
const beholder = require('./beholder');
const automationRepository = require('./repositories/automationsRepository');

(async () => {
    console.log('Getting the default settings!')
    const settings = await settingsRepository.getDefaultSettings();
    if (!settings) return new Error(`There is no settings.`);

    console.log('Initializing the Beholder Brain...')
    const automations = await automationRepository.getActiveAutomations();

    beholder.init(automations);

    console.log('Starting the Server Apps...')
    const server = app.listen(process.env.PORT || 3001, () => {
        console.log('App is running at ' + process.env.PORT);
    })

    const wss = appWs(server);
    await appEm.init(settings, wss, beholder);

    /*setTimeout(async () => {
        try {
            const result = await beholder.placeOrder(settings, automations[0], automations[0].actions[0]);
            console.log(result);
        }
        catch (err) {
            console.error(err);
        }

    }, 5000)*/
})()