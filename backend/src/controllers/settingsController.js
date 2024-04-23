function getSettings(req,res,next){
    res.json({
        email: 'contato@julliano.com.br'
    });
}

module.exports = { getSettings }