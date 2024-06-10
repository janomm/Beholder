module.exports = async (settings, message) => {

    if (!settings) throw new Error(`The settings object is required to send e-mails!`);
    if (!settings.sendGridKey || !settings.email) throw new Error(`The SendGrid settings are required to send e-mails!`);

    const KEY = 'dd2f86867eeddbe098780792861c73a1-0996409b-e93b0a3c';
    const USERNAME = 'sandbox808e2c366e314d75a36f7b25dab88e4d.mailgun.org'
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