import CryptoJS from 'crypto-js';

export const executeMD5Tool = (input) => {
  return CryptoJS.MD5(input).toString();
};