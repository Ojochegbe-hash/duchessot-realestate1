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

const replacements = [
  // Backgrounds
  [/bg-stone-50/g, 'bg-zinc-950'],
  [/bg-white/g, 'bg-zinc-900'],
  [/bg-stone-100/g, 'bg-zinc-800'],
  [/bg-stone-200/g, 'bg-zinc-800'],
  [/bg-stone-900/g, 'bg-amber-600'], // Convert dark backgrounds (like buttons, sections) to gold accents where appropriate, or zinc-900. Wait, section bg-stone-900 should be bg-zinc-900 or 950.
  [/bg-stone-950/g, 'bg-zinc-950'],
  
  // Text colors
  [/text-stone-900/g, 'text-zinc-50'],
  [/text-stone-800/g, 'text-zinc-100'],
  [/text-stone-700/g, 'text-zinc-200'],
  [/text-stone-600/g, 'text-zinc-300'],
  [/text-stone-500/g, 'text-zinc-400'],
  [/text-stone-400/g, 'text-zinc-500'],
  [/text-stone-300/g, 'text-zinc-600'],
  
  // Borders
  [/border-stone-100/g, 'border-zinc-800'],
  [/border-stone-200/g, 'border-zinc-800'],
  [/border-stone-800/g, 'border-zinc-800'],
  
  // Specific tweaks for white text on elements that were dark but are now gold
  [/text-stone-50/g, 'text-zinc-50'],
];

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Custom replacements for specific components
    if (filePath.includes('Navbar.tsx')) {
        content = content.replace(/bg-zinc-900\/80/g, 'bg-zinc-950/80'); // bg-white/80 was changed to bg-zinc-900/80, make it 950
    }
    
    replacements.forEach(([regex, replacement]) => {
      content = content.replace(regex, replacement);
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Updated', filePath);
    }
  }
});
