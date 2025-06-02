// Advanced Encoding Detective - Detects and decodes multiple encoding layers

// Detection patterns for various encodings
const ENCODING_PATTERNS = {
  base64: {
    regex: /^[A-Za-z0-9+/]*={0,2}$/,
    minLength: 4,
    test: (str) => str.length % 4 === 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(str)
  },
  base32: {
    regex: /^[A-Z2-7=\s]*$/i,
    minLength: 8,
    test: (str) => /^[A-Z2-7=\s]*$/i.test(str.replace(/\s/g, ''))
  },
  hex: {
    regex: /^[0-9A-Fa-f\s]*$/,
    minLength: 2,
    test: (str) => /^[0-9A-Fa-f\s]*$/.test(str.replace(/\s/g, '')) && str.replace(/\s/g, '').length % 2 === 0
  },
  binary: {
    regex: /^[01\s]*$/,
    minLength: 8,
    test: (str) => /^[01\s]*$/.test(str.replace(/\s/g, '')) && str.replace(/\s/g, '').length % 8 === 0
  },
  url: {
    regex: /%[0-9A-Fa-f]{2}/,
    minLength: 3,
    test: (str) => /%[0-9A-Fa-f]{2}/.test(str)
  },
  html: {
    regex: /&[a-zA-Z][a-zA-Z0-9]*;|&#[0-9]+;|&#x[0-9A-Fa-f]+;/,
    minLength: 3,
    test: (str) => /&[a-zA-Z][a-zA-Z0-9]*;|&#[0-9]+;|&#x[0-9A-Fa-f]+;/.test(str)
  },
  ascii: {
    regex: /^[\d\s]+$/,
    minLength: 2,
    test: (str) => {
      const parts = str.trim().split(/\s+/);
      return parts.length > 1 && parts.every(part => {
        const num = parseInt(part);
        return !isNaN(num) && num >= 32 && num <= 126;
      });
    }
  },
  rot13: {
    regex: /^[A-Za-z\s]*$/,
    minLength: 1,
    test: (str) => /^[A-Za-z\s]*$/.test(str) && str.length > 3
  },
  morse: {
    regex: /^[.\-\s\/]+$/,
    minLength: 3,
    test: (str) => /^[.\-\s\/]+$/.test(str)
  }
};

// Decoding functions
const decodingFunctions = {
  base64: (str) => {
    try {
      return decodeURIComponent(escape(atob(str)));
    } catch (e) {
      return null;
    }
  },
  
  base32: (str) => {
    try {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      const decodeTable = {};
      for (let i = 0; i < alphabet.length; i++) {
        decodeTable[alphabet[i]] = i;
      }
      
      const cleaned = str.replace(/[=\s]/g, '').toUpperCase();
      let buffer = 0;
      let bitsLeft = 0;
      const result = [];
      
      for (let i = 0; i < cleaned.length; i++) {
        const value = decodeTable[cleaned[i]];
        if (value === undefined) return null;
        buffer = (buffer << 5) | value;
        bitsLeft += 5;
        
        if (bitsLeft >= 8) {
          result.push((buffer >> (bitsLeft - 8)) & 255);
          bitsLeft -= 8;
        }
      }
      
      return new TextDecoder().decode(new Uint8Array(result));
    } catch (e) {
      return null;
    }
  },
  
  hex: (str) => {
    try {
      const cleaned = str.replace(/\s/g, '');
      return cleaned.match(/.{1,2}/g)
        ?.map(hex => String.fromCharCode(parseInt(hex, 16)))
        .join('') || null;
    } catch (e) {
      return null;
    }
  },
  
  binary: (str) => {
    try {
      const cleaned = str.replace(/\s/g, '');
      return cleaned.match(/.{1,8}/g)
        ?.map(bin => String.fromCharCode(parseInt(bin, 2)))
        .join('') || null;
    } catch (e) {
      return null;
    }
  },
  
  url: (str) => {
    try {
      return decodeURIComponent(str);
    } catch (e) {
      return null;
    }
  },
  
  html: (str) => {
    try {
      return str
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec)))
        .replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
    } catch (e) {
      return null;
    }
  },
  
  ascii: (str) => {
    try {
      return str.trim().split(/\s+/)
        .map(code => String.fromCharCode(parseInt(code)))
        .join('');
    } catch (e) {
      return null;
    }
  },
  
  rot13: (str) => {
    return str.replace(/[a-zA-Z]/g, char => {
      const start = char <= 'Z' ? 65 : 97;
      return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
    });
  },
  
  morse: (str) => {
    const morseMap = {
      '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
      '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
      '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
      '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
      '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
      '--..': 'Z', '-----': '0', '.----': '1', '..---': '2',
      '...--': '3', '....-': '4', '.....': '5', '-....': '6',
      '--...': '7', '---..': '8', '----.': '9'
    };
    
    try {
      return str.split(/\s+/)
        .map(code => morseMap[code] || code)
        .join('');
    } catch (e) {
      return null;
    }
  }
};

// Score encoding confidence
const scoreEncoding = (input, encoding) => {
  const pattern = ENCODING_PATTERNS[encoding];
  if (!pattern.test(input)) return 0;
  
  let score = 0;
  
  // Length-based scoring
  if (input.length >= pattern.minLength) score += 20;
  if (input.length > pattern.minLength * 2) score += 10;
  
  // Pattern-specific scoring
  switch (encoding) {
    case 'base64':
      if (input.endsWith('=') || input.endsWith('==')) score += 30;
      if (input.length % 4 === 0) score += 20;
      break;
    case 'base32':
      if (input.includes('=')) score += 20;
      if (input.length % 8 === 0) score += 15;
      break;
    case 'hex':
      if (input.length % 2 === 0) score += 25;
      if (/^[0-9A-Fa-f]+$/.test(input.replace(/\s/g, ''))) score += 20;
      break;
    case 'binary':
      if (input.length % 8 === 0) score += 30;
      break;
    case 'url':
      score += (input.match(/%[0-9A-Fa-f]{2}/g) || []).length * 5;
      break;
    case 'html':
      score += (input.match(/&[a-zA-Z][a-zA-Z0-9]*;/g) || []).length * 10;
      break;
    case 'ascii':
      const parts = input.trim().split(/\s+/);
      if (parts.every(p => !isNaN(parseInt(p)))) score += 25;
      break;
    case 'morse':
      score += (input.match(/[.\-]/g) || []).length * 2;
      break;
  }
  
  return Math.min(score, 100);
};

// Detect best encoding match
const detectEncoding = (input) => {
  const candidates = [];
  
  for (const [encoding, pattern] of Object.entries(ENCODING_PATTERNS)) {
    const score = scoreEncoding(input, encoding);
    if (score > 0) {
      candidates.push({ encoding, score, confidence: score > 70 ? 'High' : score > 40 ? 'Medium' : 'Low' });
    }
  }
  
  return candidates.sort((a, b) => b.score - a.score);
};

// Main detection and decoding function
export const executeEncodingDetective = (input) => {
  const results = {
    original: input,
    layers: [],
    analysis: {
      totalLayers: 0,
      encodingsDetected: [],
      confidence: 'Unknown'
    }
  };
  
  let current = input.trim();
  let layerCount = 0;
  const maxLayers = 20;
  
  while (layerCount < maxLayers && current.length > 0) {
    const detections = detectEncoding(current);
    
    if (detections.length === 0) {
      break;
    }
    
    const bestMatch = detections[0];
    const decoded = decodingFunctions[bestMatch.encoding](current);
    
    if (!decoded || decoded === current) {
      // Try the next best match if available
      if (detections.length > 1) {
        const secondBest = detections[1];
        const secondDecoded = decodingFunctions[secondBest.encoding](current);
        if (secondDecoded && secondDecoded !== current) {
          results.layers.push({
            layer: layerCount + 1,
            encoding: secondBest.encoding,
            confidence: secondBest.confidence,
            score: secondBest.score,
            input: current,
            output: secondDecoded,
            alternatives: detections.slice(0, 3)
          });
          current = secondDecoded;
          layerCount++;
          continue;
        }
      }
      break;
    }
    
    results.layers.push({
      layer: layerCount + 1,
      encoding: bestMatch.encoding,
      confidence: bestMatch.confidence,
      score: bestMatch.score,
      input: current,
      output: decoded,
      alternatives: detections.slice(0, 3)
    });
    
    current = decoded;
    layerCount++;
  }
  
  results.analysis.totalLayers = layerCount;
  results.analysis.encodingsDetected = [...new Set(results.layers.map(l => l.encoding))];
  results.analysis.confidence = layerCount > 0 ? 
    (results.layers.every(l => l.confidence === 'High') ? 'High' :
     results.layers.some(l => l.confidence === 'High') ? 'Medium' : 'Low') : 'None';
  
  results.finalResult = current;
  
  return results;
};