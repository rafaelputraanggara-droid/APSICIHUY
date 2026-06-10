const fs = require('fs');
const path = require('path');

const directoriesToSearch = [
  path.join(__dirname, 'app'),
  path.join(__dirname, 'components'),
];

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('Admin BMN')) {
    const updatedContent = content.replace(/Admin BMN/g, 'Admin Fakultas');
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function traverseDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverseDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

directoriesToSearch.forEach(traverseDirectory);
console.log('Done replacing!');
