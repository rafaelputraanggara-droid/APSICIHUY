const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function fixTheme(filePath) {
  if (!filePath.endsWith('.tsx')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace text-neutral-500
  content = content.replace(/text-neutral-500(?!\s+dark:)/g, 'text-[var(--text-muted)]');
  content = content.replace(/text-neutral-600(?!\s+dark:)/g, 'text-[var(--text-muted)]');
  content = content.replace(/text-neutral-400(?!\s+dark:)/g, 'text-[var(--text-muted)]');
  content = content.replace(/text-neutral-900(?!\s+dark:)/g, 'text-[var(--text-main)]');
  
  // Replace bg-neutral-50 without dark variant
  content = content.replace(/bg-neutral-50(?!\s+dark:)/g, 'bg-[var(--bg-app)] transition-colors duration-400');
  
  // Replace white without dark
  content = content.replace(/bg-white(?!\s+dark:|\/|\w)/g, 'bg-[var(--bg-panel)] transition-colors duration-400');

  // Replace border-neutral
  content = content.replace(/border-neutral-200(?!\s+dark:)/g, 'border-[var(--border-panel)]');
  content = content.replace(/border-neutral-100(?!\s+dark:)/g, 'border-[var(--border-panel)]');
  
  // Replace dark only properties that are still lingering
  content = content.replace(/dark:bg-neutral-900/g, 'bg-[var(--bg-panel)]');
  content = content.replace(/dark:bg-neutral-950/g, 'bg-[var(--bg-app)]');
  content = content.replace(/dark:border-neutral-800/g, 'border-[var(--border-panel)]');
  content = content.replace(/dark:text-white/g, 'text-[var(--text-main)]');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed more:', filePath);
  }
}

walkDir(path.join(__dirname, 'app'), fixTheme);
console.log('Done fixing theme.');
