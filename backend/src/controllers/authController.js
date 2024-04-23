const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const blacklist = [];

function doLogin(req,res,next){
    const email = req.body.email;
    const password = req.body.password;

    if (email === 'contato@julliano.com.br'
        && bcrypt.compareSync(password,"$2a$12$tkYs7vOE8SgRWS9ao4TJsOcZvttwj6F3KWuTukqHabvpXhOiWSVTi")) {
            const token = jwt.sign({id:1}, process.env.JWT_SECRET, {expiresIn: parseInt(process.env.JWT_EXPIRES) });
        res.json({token});
        //console.log(token);
    } else {
        res.sendStatus(401);
    }

}

function doLogout(req,res,next){
    console.log("doLogout");
    const token = req.headers['authorization'];
    blacklist.push(token);
    res.sendStatus(200);
}

function isBlackListed(token){
    return blacklist.some(t => t === token);
}

module.exports = {
    doLogin,
    doLogout,
    isBlackListed
}