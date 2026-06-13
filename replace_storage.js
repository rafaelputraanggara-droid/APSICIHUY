const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const files = [...walk('./app'), ...walk('./components')];
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('localStorage')) {
        let changed = false;
        if (content.includes('localStorage.getItem("simulated_user")')) {
            content = content.replace(/localStorage\.getItem\("simulated_user"\)/g, 'sessionStorage.getItem("simulated_user")');
            changed = true;
        }
        if (content.includes('localStorage.setItem("simulated_user"')) {
            content = content.replace(/localStorage\.setItem\("simulated_user"/g, 'sessionStorage.setItem("simulated_user"');
            changed = true;
        }
        if (content.includes('localStorage.removeItem("simulated_user")')) {
            content = content.replace(/localStorage\.removeItem\("simulated_user"\)/g, 'sessionStorage.removeItem("simulated_user")');
            changed = true;
        }
        
        if (changed) {
            fs.writeFileSync(file, content, 'utf8');
            console.log('Updated ' + file);
        }
    }
});
