/**
 * @file scripts/patch-zama-sdk.js
 * @description Automatically patches @zama-fhe/react-sdk to resolve a Wagmi version
 * mismatch where a Wagmi v3 action ('watchConnection') is imported, but the project
 * runs Wagmi v2. Replaces it with the correct Wagmi v2 action ('watchAccount').
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'node_modules', '@zama-fhe', 'react-sdk', 'dist', 'wagmi', 'index.js');

try {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('watchConnection as s')) {
      content = content.replace('watchConnection as s', 'watchAccount as s');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Successfully patched @zama-fhe/react-sdk to use watchAccount (Wagmi v2 compatibility).');
    } else {
      console.log('@zama-fhe/react-sdk is already patched or does not contain watchConnection.');
    }
  } else {
    console.warn('Target file not found for patching: @zama-fhe/react-sdk/dist/wagmi/index.js');
  }
} catch (error) {
  console.error('Failed to patch @zama-fhe/react-sdk:', error);
}
