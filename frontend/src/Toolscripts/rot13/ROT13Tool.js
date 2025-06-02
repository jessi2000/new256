export const executeROT13Tool = (input) => {
  return input.replace(/[a-zA-Z]/g, char => {
    const start = char <= 'Z' ? 65 : 97;
    return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
  });
};