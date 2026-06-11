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

function fixTags(filePath) {
  if (!filePath.endsWith('.tsx')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Fix Success Tags
  content = content.replace(/bg-(?:emerald|green)-100(?:\s+dark:bg-(?:emerald|green)-900\/30)?\s+text-(?:emerald|green)-(?:800|700)(?:\s+dark:text-(?:emerald|green)-(?:400|500))?/g, 'bg-[var(--tag-success-bg)] text-[var(--tag-success-text)] transition-colors duration-400');
  
  content = content.replace(/bg-(?:emerald|green)-100\s+text-(?:emerald|green)-(?:800|700)/g, 'bg-[var(--tag-success-bg)] text-[var(--tag-success-text)] transition-colors duration-400');

  // Fix Danger Tags
  content = content.replace(/bg-(?:rose|red)-100(?:\s+dark:bg-(?:rose|red)-900\/30)?\s+text-(?:rose|red)-(?:800|700)(?:\s+dark:text-(?:rose|red)-(?:400|500))?/g, 'bg-[var(--tag-danger-bg)] text-[var(--tag-danger-text)] transition-colors duration-400');
  
  content = content.replace(/bg-(?:rose|red)-100\s+text-(?:rose|red)-(?:800|700)/g, 'bg-[var(--tag-danger-bg)] text-[var(--tag-danger-text)] transition-colors duration-400');

  // Fix Warning Tags
  content = content.replace(/bg-(?:amber|yellow)-100(?:\s+dark:bg-(?:amber|yellow)-900\/30)?\s+text-(?:amber|yellow)-(?:800|700)(?:\s+dark:text-(?:amber|yellow)-(?:400|500))?/g, 'bg-[var(--tag-warning-bg)] text-[var(--tag-warning-text)] transition-colors duration-400');
  
  content = content.replace(/bg-(?:amber|yellow)-100\s+text-(?:amber|yellow)-(?:800|700)/g, 'bg-[var(--tag-warning-bg)] text-[var(--tag-warning-text)] transition-colors duration-400');

  // Fix Info Tags
  content = content.replace(/bg-(?:indigo|blue)-100(?:\s+dark:bg-(?:indigo|blue)-900\/30)?\s+text-(?:indigo|blue)-(?:800|700)(?:\s+dark:text-(?:indigo|blue)-(?:400|500))?/g, 'bg-[var(--tag-info-bg)] text-[var(--tag-info-text)] transition-colors duration-400');
  
  content = content.replace(/bg-(?:indigo|blue)-100\s+text-(?:indigo|blue)-(?:800|700)/g, 'bg-[var(--tag-info-bg)] text-[var(--tag-info-text)] transition-colors duration-400');

  // Also catch simple text colors that might be unreadable in dark mode
  content = content.replace(/text-indigo-600(?!\s+dark:)/g, 'text-[var(--tag-info-text)] transition-colors duration-400');
  content = content.replace(/text-emerald-600(?!\s+dark:)/g, 'text-[var(--tag-success-text)] transition-colors duration-400');
  content = content.replace(/text-rose-600(?!\s+dark:)/g, 'text-[var(--tag-danger-text)] transition-colors duration-400');
  content = content.replace(/text-amber-600(?!\s+dark:)/g, 'text-[var(--tag-warning-text)] transition-colors duration-400');
  
  // Replace dark: variants that are still lingering
  content = content.replace(/\s+dark:bg-(?:emerald|rose|indigo|amber|green|red|blue)-900\/30/g, '');
  content = content.replace(/\s+dark:text-(?:emerald|rose|indigo|amber|green|red|blue)-(?:400|500)/g, '');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed tags:', filePath);
  }
}

walkDir(path.join(__dirname, 'app'), fixTags);
console.log('Done fixing tags.');
