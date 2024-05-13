const aes = require('aes-js');

const key = aes.utils.utf8.toBytes(process.env.AES_KEY);
if (key.length !== 32) {
    throw new Error('Invalid key for AES. Must to be 256-bit / 32 bytes')
}

function encrypt(text) {
    const bytesInfo = aes.utils.utf8.toBytes(text);
    const aesCTR = new aes.ModeOfOperation.ctr(key);
    const encryptedBytes = aesCTR.encrypt(bytesInfo);
    return aes.utils.hex.fromBytes(encryptedBytes);
}

function decrypt(encryptedHex) {
    const enctryptedBytes = aes.utils.hex.toBytes(encryptedHex);
    const aesCTR = new aes.ModeOfOperation.ctr(key);
    const decryptBytes = aesCTR.decrypt(enctryptedBytes);
    return aes.utils.utf8.fromBytes(decryptBytes);

}


module.exports = {
    encrypt,
    decrypt
}

