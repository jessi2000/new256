import CryptoJS from 'crypto-js';

export const executeSHA256Tool = (input) => {
  return CryptoJS.SHA256(input).toString();
};