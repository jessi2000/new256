export const executeBinaryTool = (input, action) => {
  if (action === 'encode') {
    return Array.from(input)
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join(' ');
  } else {
    try {
      return input
        .replace(/[^01]/g, '')
        .match(/.{1,8}/g)
        ?.map(bin => String.fromCharCode(parseInt(bin, 2)))
        .join('') || 'Invalid binary input';
    } catch (e) {
      return 'Invalid binary input';
    }
  }
};