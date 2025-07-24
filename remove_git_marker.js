const fs = require('fs');
const path = require('path');

const GIT_MARKER = '// git';

// Skip these directories
const SKIP_DIRS = ['node_modules', '.next', '.git', 'dist', 'build'];

function cleanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes(GIT_MARKER)) {
      const cleaned = content.replace(new RegExp(`\\s*${GIT_MARKER}\\s*$`, 'g'), '').trim();
      fs.writeFileSync(filePath, cleaned + '\n', 'utf-8');
      console.log(`✔ Cleaned: ${path.relative(process.cwd(), filePath)}`);
    }
  } catch (error) {
    // Skip files that can't be read
  }
}

function walk(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip unwanted directories
        if (!SKIP_DIRS.includes(file)) {
          walk(fullPath);
        }
      } else if (/\.(tsx?|jsx?|json|css|html|md)$/.test(file)) {
        cleanFile(fullPath);
      }
    }
  } catch (error) {
    // Skip directories that can't be accessed
  }
}

console.log('🚀 Fast cleaning - skipping node_modules and .next...');
console.log('📁 Only scanning: src, components, lib, etc...');

const startTime = Date.now();
walk(process.cwd());
const endTime = Date.now();

console.log(`✅ Done in ${endTime - startTime}ms!`);
