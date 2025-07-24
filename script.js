const fs = require('fs');
const path = require('path');

const GIT_MARKER = '// git';

function editFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (!content.includes(GIT_MARKER)) {
    const updated = content + `\n${GIT_MARKER}\n`;
    fs.writeFileSync(filePath, updated, 'utf-8');
    console.log(`✔ Modified: ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (
      /\.(tsx?|jsx?|json|css|html)$/.test(file)
    ) {
      editFile(fullPath);
    }
  }
}

walk(process.cwd());
