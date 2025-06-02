// Base32 encoding/decoding with multi-layer support

// Base32 alphabet (RFC 4648)
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Create lookup tables
const encodeTable = BASE32_ALPHABET.split('');
const decodeTable = {};
for (let i = 0; i < BASE32_ALPHABET.length; i++) {
  decodeTable[BASE32_ALPHABET[i]] = i;
}

// Base32 encode function
const base32Encode = (input) => {
  const bytes = new TextEncoder().encode(input);
  let result = '';
  let buffer = 0;
  let bitsLeft = 0;
  
  for (let i = 0; i < bytes.length; i++) {
    buffer = (buffer << 8) | bytes[i];
    bitsLeft += 8;
    
    while (bitsLeft >= 5) {
      const index = (buffer >> (bitsLeft - 5)) & 31;
      result += encodeTable[index];
      bitsLeft -= 5;
    }
  }
  
  if (bitsLeft > 0) {
    const index = (buffer << (5 - bitsLeft)) & 31;
    result += encodeTable[index];
  }
  
  // Add padding
  while (result.length % 8 !== 0) {
    result += '=';
  }
  
  return result;
};

// Base32 decode function
const base32Decode = (input) => {
  // Remove padding and whitespace
  const cleaned = input.replace(/[=\s]/g, '').toUpperCase();
  
  // Validate input
  for (let char of cleaned) {
    if (!(char in decodeTable)) {
      throw new Error(`Invalid Base32 character: ${char}`);
    }
  }
  
  let buffer = 0;
  let bitsLeft = 0;
  const result = [];
  
  for (let i = 0; i < cleaned.length; i++) {
    const value = decodeTable[cleaned[i]];
    buffer = (buffer << 5) | value;
    bitsLeft += 5;
    
    if (bitsLeft >= 8) {
      result.push((buffer >> (bitsLeft - 8)) & 255);
      bitsLeft -= 8;
    }
  }
  
  return new TextDecoder().decode(new Uint8Array(result));
};

// Multi-layer Base32 decoding function
export const multiLayerBase32Decode = (input) => {
  let current = input.trim();
  let layers = [];
  let attempts = 0;
  const maxAttempts = 50;

  while (attempts < maxAttempts) {
    // Check if current string looks like Base32
    const base32Regex = /^[A-Z2-7=\s]+$/i;
    if (!base32Regex.test(current)) {
      break;
    }

    try {
      const decoded = base32Decode(current);
      layers.push({
        layer: attempts + 1,
        input: current,
        output: decoded
      });
      
      // If decoded result is the same as input, or not Base32, we're done
      if (decoded === current || !base32Regex.test(decoded)) {
        break;
      }
      
      current = decoded;
      attempts++;
    } catch (e) {
      break;
    }
  }

  if (attempts === 0) {
    return {
      finalResult: 'Not a valid Base32 string',
      layers: [],
      totalLayers: 0
    };
  }

  return {
    finalResult: layers[layers.length - 1]?.output || current,
    layers: layers,
    totalLayers: layers.length
  };
};

export const executeBase32Tool = (input, action) => {
  if (action === 'encode') {
    return base32Encode(input);
  } else {
    return multiLayerBase32Decode(input);
  }
};