const fs = require('fs');
let content = fs.readFileSync('src/pages/Properties.tsx', 'utf8');
content = content.replace(/className="px-4 py-4 rounded-xl bg-white border border-stone-200 text-stone-900 outline-none focus:ring-2 focus:ring-primary min-w-\[120px\]"/g, 'className="px-4 py-4 rounded-xl bg-white border border-stone-200 text-stone-900 outline-none focus:ring-2 focus:ring-primary min-w-[120px] appearance-auto"');
content = content.replace(/className="px-4 py-4 rounded-xl bg-white border border-stone-200 text-stone-900 outline-none focus:ring-2 focus:ring-primary min-w-\[140px\]"/g, 'className="px-4 py-4 rounded-xl bg-white border border-stone-200 text-stone-900 outline-none focus:ring-2 focus:ring-primary min-w-[140px] appearance-auto"');
fs.writeFileSync('src/pages/Properties.tsx', content);
