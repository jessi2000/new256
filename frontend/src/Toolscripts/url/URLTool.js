export const executeURLTool = (input, action) => {
  if (action === 'encode') {
    return encodeURIComponent(input);
  } else {
    try {
      return decodeURIComponent(input);
    } catch (e) {
      return 'Invalid URL encoding';
    }
  }
};