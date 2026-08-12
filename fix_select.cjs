const fs = require('fs');
function fixSelects(file) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/(<select[^>]*className=["'])([^"']*?)(["'][^>]*>)/g, (match, p1, p2, p3) => {
       if (!p2.includes('appearance-auto')) {
           return p1 + p2 + ' appearance-auto' + p3;
       }
       return match;
    });
    fs.writeFileSync(file, content);
  } catch (e) {}
}
fixSelects('src/pages/admin/PropertyForm.tsx');
fixSelects('src/pages/Properties.tsx');
console.log('Fixed dropdowns');
