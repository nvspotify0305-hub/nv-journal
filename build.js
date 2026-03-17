// NV Journal — Build Script v2
// Works with both JSX source files AND pre-compiled files
// Usage: node build.js
const fs = require('fs');
const path = require('path');

const INPUT  = path.join(__dirname, 'NVJournal_source.html');
const OUTPUT = path.join(__dirname, 'index.html');

if (!fs.existsSync(INPUT)) {
  console.error('ERROR: NVJournal_source.html not found in ' + __dirname);
  process.exit(1);
}

const html = fs.readFileSync(INPUT, 'utf8');

// Check if this is a JSX source file (needs compilation) or pre-compiled
const startTag = /<script[^>]+type=["']text\/babel["'][^>]*>/i;
const startMatch = html.match(startTag);

if (startMatch) {
  // JSX source — compile with Babel
  let babel;
  try { babel = require('@babel/core'); } catch(e) {
    console.error('ERROR: @babel/core not found. Run: npm install');
    process.exit(1);
  }
  const scriptStart = html.indexOf(startMatch[0]);
  const codeStart   = scriptStart + startMatch[0].length;
  const codeEnd     = html.indexOf('</script>', codeStart);
  if (codeEnd === -1) { console.error('ERROR: Could not find closing </script>'); process.exit(1); }
  const jsx = html.substring(codeStart, codeEnd);
  console.log('Compiling JSX (' + jsx.length + ' chars)...');
  let compiled;
  try {
    const result = babel.transformSync(jsx, {
      presets: ['@babel/preset-react', '@babel/preset-env'],
      compact: false,
    });
    compiled = result.code;
  } catch (e) { console.error('COMPILE ERROR:\n' + e.message); process.exit(1); }
  const before = html.substring(0, scriptStart);
  const after  = html.substring(codeEnd + '</script>'.length);
  let output = before + '<script>' + compiled + '</script>' + after;
  output = output.replace(/[ \t]*<script[^>]+babel\.min\.js[^>]*><\/script>\r?\n?/i, '');
  fs.writeFileSync(OUTPUT, output, 'utf8');
  console.log('Done. (JSX compiled)');
} else {
  // Pre-compiled — copy directly as index.html
  console.log('Pre-compiled file detected — copying directly...');
  fs.writeFileSync(OUTPUT, html, 'utf8');
  console.log('Done. (no compilation needed)');
}

const inputSize  = Math.round(fs.statSync(INPUT).size  / 1024);
const outputSize = Math.round(fs.statSync(OUTPUT).size / 1024);
console.log('  Input:  ' + inputSize  + ' KB  (' + INPUT  + ')');
console.log('  Output: ' + outputSize + ' KB  (' + OUTPUT + ')');
console.log('  Upload index.html to GitHub as index.html');
