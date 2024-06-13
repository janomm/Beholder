module.exports = async (settings, message) => {

    if (!settings) throw new Error(`The settings object is required to send e-mails!`);
    if (!settings.sendGridKey || !settings.email) throw new Error(`The SendGrid settings are required to send e-mails!`);

    const KEY = '';
    const USERNAME = ''
    const formData = require('form-data');
    const Mailgun = require('mailgun.js');
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({ username: USERNAME, key: KEY });

    /*return await mg.messages.create('sandbox-123.mailgun.org', {
        from: "Excited User <mailgun@sandbox-123.mailgun.org>",
        to: ["janomm@gmail.com"],
        subject: "Hello",
        text: "Testing some Mailgun awesomeness!",
        html: "<h1>Testing some Mailgun awesomeness!</h1>"
    })
        .then(msg => console.log(msg)) // logs response data
        .catch(err => console.log(err)); // logs any error*/

    return true;
}