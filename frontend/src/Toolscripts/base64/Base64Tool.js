// Multi-layer Base64 decoding function
export const multiLayerBase64Decode = (input) => {
  let current = input.trim();
  let layers = [];
  let attempts = 0;
  const maxAttempts = 50;

  while (attempts < maxAttempts) {
    // Check if current string is valid base64
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(current) || current.length % 4 !== 0) {
      break;
    }

    try {
      const decoded = decodeURIComponent(escape(atob(current)));
      layers.push({
        layer: attempts + 1,
        input: current,
        output: decoded
      });
      
      // If decoded result is the same as input, or not base64, we're done
      if (decoded === current || !base64Regex.test(decoded)) {
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
      finalResult: 'Not a valid Base64 string',
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

export const executeBase64Tool = (input, action) => {
  if (action === 'encode') {
    return btoa(unescape(encodeURIComponent(input)));
  } else {
    return multiLayerBase64Decode(input);
  }
};