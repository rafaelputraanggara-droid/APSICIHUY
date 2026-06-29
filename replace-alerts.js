const fs = require('fs');
const path = require('path');

const dir = './app';

function walk(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Insert imports safely
  if ((content.includes('alert(') || content.includes('window.alert(') || content.includes('confirm(') || content.includes('window.confirm(')) && !content.includes('const MySwal')) {
    const importStatement = "\nimport Swal from 'sweetalert2';\nimport withReactContent from 'sweetalert2-react-content';\nconst MySwal = withReactContent(Swal);\n";
    
    // Find the end of "use client"
    let match = content.match(/['"]use client['"];?/);
    if (match) {
      content = content.replace(match[0], match[0] + importStatement);
    } else {
      content = `"use client";\n${importStatement}\n` + content;
    }
  }

  // Helper to replace function calls by counting parentheses
  function replaceCall(funcName, replacer) {
    let searchStr = funcName + '(';
    let idx = 0;
    while ((idx = content.indexOf(searchStr, idx)) !== -1) {
      // make sure it's not a word boundary issue (e.g. somealert() )
      let before = content[idx - 1];
      if (before && /[a-zA-Z0-9_]/.test(before)) {
        idx += searchStr.length;
        continue;
      }

      let start = idx + searchStr.length;
      let openCount = 1;
      let curr = start;
      while (curr < content.length && openCount > 0) {
        if (content[curr] === '(') openCount++;
        if (content[curr] === ')') openCount--;
        curr++;
      }
      
      let end = curr - 1; // position of the closing parenthesis
      let arg = content.substring(start, end);

      // Check if it's prefixed by "return "
      // We look back from idx
      let prefixMatch = content.substring(Math.max(0, idx - 10), idx);
      let isReturn = prefixMatch.match(/\breturn\s*$/);

      let replacement = replacer(arg, !!isReturn);
      
      let fullMatchStart = isReturn ? idx - prefixMatch.match(/\breturn\s*$/)[0].length : idx;
      let fullMatchEnd = curr;
      // also remove trailing semicolon if exists
      if (content[curr] === ';') {
        fullMatchEnd++;
      }

      content = content.substring(0, fullMatchStart) + replacement + content.substring(fullMatchEnd);
      idx = fullMatchStart + replacement.length;
    }
  }

  replaceCall('window.confirm', (arg) => `(await MySwal.fire({ title: 'Konfirmasi', text: String(${arg}), icon: 'warning', showCancelButton: true, confirmButtonColor: '#4f46e5', cancelButtonColor: '#d33', confirmButtonText: 'Ya', cancelButtonText: 'Batal', background: '#1a1a1a', color: '#ffffff' })).isConfirmed`);
  replaceCall('confirm', (arg) => `(await MySwal.fire({ title: 'Konfirmasi', text: String(${arg}), icon: 'warning', showCancelButton: true, confirmButtonColor: '#4f46e5', cancelButtonColor: '#d33', confirmButtonText: 'Ya', cancelButtonText: 'Batal', background: '#1a1a1a', color: '#ffffff' })).isConfirmed`);

  replaceCall('window.alert', (arg, isReturn) => {
    let str = `MySwal.fire({ title: 'Notifikasi Sistem', text: String(${arg}), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' })`;
    return isReturn ? `await ${str}; return;` : `${str};`;
  });
  replaceCall('alert', (arg, isReturn) => {
    let str = `MySwal.fire({ title: 'Notifikasi Sistem', text: String(${arg}), icon: 'info', confirmButtonColor: '#4f46e5', background: '#1a1a1a', color: '#ffffff' })`;
    return isReturn ? `await ${str}; return;` : `${str};`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated: ' + filePath);
  }
}

walk(dir);
console.log('Done');
