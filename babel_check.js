const Babel = require('@babel/standalone');
const fs = require('fs');

try {
  const code1 = fs.readFileSync('frontend/js/components.js', 'utf-8');
  Babel.transform(code1, { presets: ['react'] });
  console.log('components.js compiled successfully');
} catch (e) {
  console.error('Error compiling components.js:', e.message);
}

try {
  const code2 = fs.readFileSync('frontend/js/app.js', 'utf-8');
  Babel.transform(code2, { presets: ['react'] });
  console.log('app.js compiled successfully');
} catch (e) {
  console.error('Error compiling app.js:', e.message);
}
