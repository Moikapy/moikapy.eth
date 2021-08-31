/**
 * @function encryptData
 * @description Creates a AES Cipher based on incoming data and a secret key, encrypts data
 * @param {any} Data
 * @param {string} secretkey
 */

var AES = require('crypto-js/aes');
export default function encryptData(data, secretKey) {
  if (secretKey) {
    // Encrypt
    return AES.encrypt(data, secretKey).toString();
  }
  throw new Error('To Encrpyt Data Please Add Secret Key');
}
