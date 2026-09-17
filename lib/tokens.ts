const crypto_token = require('crypto');

export function generateToken(bytes = 32){
    return crypto_token.randomBytes(bytes).toString('hex');
}