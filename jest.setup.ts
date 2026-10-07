import '@testing-library/jest-dom';

// TextEncoder/TextDecoder are available in Node.js but not always in jsdom
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}
