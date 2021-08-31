const crypto = require('crypto');

/**
 * @function decryptData
 * @description Creates a AES Cipher based on incoming data and a secret key, decrypts data
 * @param {any} Data
 * @param {string} secretkey
 */

var CryptoJS = require('crypto-js');
export default function decryptData(data, secretKey) {
  if (secretKey) {
    // Decrypt
    return CryptoJS.AES.decrypt(data, secretKey);
  }
  throw new Error('To Encrpyt Data Please Add Secret Key');
}
