const app = require('./app');

app.listen(process.env.PORT, () => {
    console.log('app is running at ' + process.env.PORT);
})