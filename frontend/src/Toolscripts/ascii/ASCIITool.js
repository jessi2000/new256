export const executeASCIITool = (input, action) => {
  if (action === 'encode') {
    return Array.from(input)
      .map(char => char.charCodeAt(0))
      .join(' ');
  } else {
    try {
      return input
        .split(/\s+/)
        .map(code => String.fromCharCode(parseInt(code)))
        .join('');
    } catch (e) {
      return 'Invalid ASCII codes';
    }
  }
};