const fs = require('fs');
const path = require('path');

const directoriesToMigrate = [
  "components/dashboard",
  "components/admin",
  "app/dashboard",
  "app/admin",
  "components/ui"
];

function getAllTsxFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllTsxFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

let filesToMigrate = [];
for (const dir of directoriesToMigrate) {
    if (fs.existsSync(dir)) {
        filesToMigrate = filesToMigrate.concat(getAllTsxFiles(dir));
    }
}

let modifiedCount = 0;

for (const file of filesToMigrate) {
  try {
    let originalContent = fs.readFileSync(file, 'utf8');
    let content = originalContent;

    // --- TEXT COLORS ---
    content = content.replace(/text-slate-400/g, 'text-[#6b6b6b]');
    content = content.replace(/text-slate-300/g, 'text-[#14110c]');
    content = content.replace(/text-slate-200/g, 'text-[#14110c]');
    content = content.replace(/text-slate-100/g, 'text-[#14110c]');
    content = content.replace(/text-slate-50\b/g, 'text-[#14110c]');
    content = content.replace(/text-white/g, 'text-[#14110c]');
    
    // --- BACKGROUND COLORS ---
    content = content.replace(/bg-slate-950(?:\/([0-9]+))?/g, 'bg-[#faf8f3]');
    // Wait, some cards use bg-[#0B0F19]
    content = content.replace(/bg-\[\#0B0F19\]/g, 'bg-[#ffffff]');
    
    // bg-slate-900 maps to white for cards/sidebars, EXCEPT in layout wrappers where we might want something else?
    // Actually, bg-[#ffffff] is great for cards inside the #faf8f3 layout.
    content = content.replace(/bg-slate-900\/40/g, 'bg-[#ffffff]');
    content = content.replace(/bg-slate-900\/50/g, 'bg-[#ffffff]');
    content = content.replace(/bg-slate-900\/95/g, 'bg-[#faf8f3]/95'); // header
    content = content.replace(/bg-slate-900/g, 'bg-[#ffffff]');
    
    content = content.replace(/bg-slate-800\/40/g, 'bg-[#e6e1d8]/40');
    content = content.replace(/bg-slate-800\/50/g, 'bg-[#e6e1d8]/50');
    content = content.replace(/bg-slate-800/g, 'bg-[#e6e1d8]');
    content = content.replace(/bg-slate-700/g, 'bg-[#e6e1d8]');
    
    // --- BORDER COLORS ---
    content = content.replace(/border-slate-800/g, 'border-[#d9d4c9]');
    content = content.replace(/border-slate-700/g, 'border-[#d9d4c9]');
    content = content.replace(/border-slate-600/g, 'border-[#d9d4c9]');
    
    // --- HOVER STATES ---
    content = content.replace(/hover:bg-slate-800/g, 'hover:bg-[#e6e1d8]');
    content = content.replace(/hover:bg-slate-700/g, 'hover:bg-[#e6e1d8]');
    content = content.replace(/hover:text-white/g, 'hover:text-[#14110c]');
    content = content.replace(/hover:text-slate-300/g, 'hover:text-[#14110c]');
    content = content.replace(/hover:text-slate-200/g, 'hover:text-[#14110c]');
    
    // --- ACCENT COLORS (Lime -> Gold) ---
    content = content.replace(/text-lime-400/g, 'text-[#b08d3e]');
    content = content.replace(/text-lime-300/g, 'text-[#8a6d28]');
    
    content = content.replace(/bg-lime-400\/10/g, 'bg-[#b08d3e]/10');
    content = content.replace(/bg-lime-400\/20/g, 'bg-[#b08d3e]/20');
    content = content.replace(/bg-lime-400/g, 'bg-[#b08d3e]');
    content = content.replace(/bg-lime-500/g, 'bg-[#b08d3e]');
    
    content = content.replace(/border-lime-400\/20/g, 'border-[#b08d3e]/20');
    content = content.replace(/border-lime-400/g, 'border-[#b08d3e]');
    content = content.replace(/ring-lime-400/g, 'ring-[#b08d3e]');
    
    content = content.replace(/hover:bg-lime-500/g, 'hover:bg-[#8a6d28]');
    content = content.replace(/hover:bg-lime-300/g, 'hover:bg-[#e6e1d8]');
    content = content.replace(/hover:text-lime-400/g, 'hover:text-[#b08d3e]');
    
    // Gradient stops
    content = content.replace(/from-lime-400\/10/g, 'from-[#b08d3e]/10');
    
    // --- MISC ---
    content = content.replace(/ring-slate-800/g, 'ring-[#d9d4c9]');
    content = content.replace(/divide-slate-800/g, 'divide-[#d9d4c9]');
    content = content.replace(/from-slate-900/g, 'from-white');
    content = content.replace(/to-slate-950/g, 'to-[#faf8f3]');
    content = content.replace(/via-slate-900/g, 'via-[#faf8f3]');
    
    // Fix text-slate-900 if it was used on a previously lime (now gold) background for contrast
    // It used to be dark text on light lime. Now it's on dark gold. So we should change it to white.
    content = content.replace(/text-slate-900/g, 'text-white');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Migrated ${file}`);
        modifiedCount++;
    }
  } catch (error) {
    console.error(`Error migrating ${file}: ${error.message}`);
  }
}

console.log(`Migration complete. Modified ${modifiedCount} files.`);
