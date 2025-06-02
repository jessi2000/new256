export const executeHexTool = (input, action) => {
  if (action === 'encode') {
    return Array.from(input)
      .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(' ');
  } else {
    try {
      return input
        .replace(/[^0-9a-fA-F]/g, '')
        .match(/.{1,2}/g)
        ?.map(hex => String.fromCharCode(parseInt(hex, 16)))
        .join('') || 'Invalid hex input';
    } catch (e) {
      return 'Invalid hex input';
    }
  }
};