// Dynamic tool loader
import { 
  Code, 
  Lock, 
  Hash, 
  FileText, 
  RotateCcw,
  Search
} from 'lucide-react';

// Import all tool configurations
import base64Config from './base64/config.json';
import urlConfig from './url/config.json';
import base32Config from './base32/config.json';
import hexConfig from './hex/config.json';
import binaryConfig from './binary/config.json';
import asciiConfig from './ascii/config.json';
import caesarConfig from './caesar-cipher/config.json';
import rot13Config from './rot13/config.json';
import encodingDetectiveConfig from './encoding-detective/config.json';

// Icon mapping
const iconMap = {
  'Code': Code,
  'Lock': Lock,
  'Hash': Hash,
  'FileText': FileText,
  'RotateCcw': RotateCcw,
  'Search': Search
};

// Load all tool configurations
const toolConfigs = [
  base64Config,
  urlConfig,
  base32Config,
  hexConfig,
  binaryConfig,
  asciiConfig,
  caesarConfig,
  rot13Config,
  encodingDetectiveConfig
];

// Process tools and add icon components
export const loadTools = () => {
  return toolConfigs.map(config => ({
    ...config,
    icon: iconMap[config.icon] || Code
  }));
};

// Tool execution router
export const executeTool = async (toolId, input, action, params = {}) => {
  switch (toolId) {
    case 'base64': {
      const { executeBase64Tool } = await import('./base64/Base64Tool.js');
      return executeBase64Tool(input, action);
    }
    case 'url': {
      const { executeURLTool } = await import('./url/URLTool.js');
      return executeURLTool(input, action);
    }
    case 'base32': {
      const { executeBase32Tool } = await import('./base32/Base32Tool.js');
      return executeBase32Tool(input, action);
    }
    case 'hex': {
      const { executeHexTool } = await import('./hex/HexTool.js');
      return executeHexTool(input, action);
    }
    case 'binary': {
      const { executeBinaryTool } = await import('./binary/BinaryTool.js');
      return executeBinaryTool(input, action);
    }
    case 'ascii': {
      const { executeASCIITool } = await import('./ascii/ASCIITool.js');
      return executeASCIITool(input, action);
    }
    case 'caesar-cipher': {
      const { executeCaesarTool } = await import('./caesar-cipher/CaesarTool.js');
      return executeCaesarTool(input, params.shift || 3);
    }
    case 'rot13': {
      const { executeROT13Tool } = await import('./rot13/ROT13Tool.js');
      return executeROT13Tool(input);
    }
    case 'encoding-detective': {
      const { executeEncodingDetective } = await import('./encoding-detective/EncodingDetectiveTool.js');
      return executeEncodingDetective(input);
    }
    default:
      return 'Tool not implemented yet';
  }
};