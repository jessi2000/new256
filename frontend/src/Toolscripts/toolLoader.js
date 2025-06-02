// Dynamic tool loader
import { 
  Code, 
  Lock, 
  Hash, 
  FileText, 
  RotateCcw 
} from 'lucide-react';

// Import all tool configurations
import base64Config from './base64/config.json';
import urlConfig from './url/config.json';
import htmlConfig from './html/config.json';
import hexConfig from './hex/config.json';
import binaryConfig from './binary/config.json';
import asciiConfig from './ascii/config.json';
import caesarConfig from './caesar-cipher/config.json';
import rot13Config from './rot13/config.json';
import md5Config from './md5-hash/config.json';
import sha256Config from './sha256-hash/config.json';

// Icon mapping
const iconMap = {
  'Code': Code,
  'Lock': Lock,
  'Hash': Hash,
  'FileText': FileText,
  'RotateCcw': RotateCcw
};

// Load all tool configurations
const toolConfigs = [
  base64Config,
  urlConfig,
  htmlConfig,
  hexConfig,
  binaryConfig,
  asciiConfig,
  caesarConfig,
  rot13Config,
  md5Config,
  sha256Config
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
    case 'html': {
      const { executeHTMLTool } = await import('./html/HTMLTool.js');
      return executeHTMLTool(input, action);
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
    case 'md5-hash': {
      const { executeMD5Tool } = await import('./md5-hash/MD5Tool.js');
      return executeMD5Tool(input);
    }
    case 'sha256-hash': {
      const { executeSHA256Tool } = await import('./sha256-hash/SHA256Tool.js');
      return executeSHA256Tool(input);
    }
    default:
      return 'Tool not implemented yet';
  }
};