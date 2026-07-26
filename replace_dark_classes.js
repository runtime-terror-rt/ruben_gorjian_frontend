const fs = require('fs');
const file = 'app/admin/enterprise-plan/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The modal headers and footers have `border-white/5` which should be `border-[#d9d4c9]`
content = content.replace(/border-white\/5/g, 'border-[#d9d4c9]');
content = content.replace(/border-white\/10/g, 'border-[#d9d4c9]');

// Option buttons (unselected)
content = content.replace(/bg-white\/5 border-\[#d9d4c9\] text-\[#6b6b6b\] hover:border-\[#d9d4c9\]/g, 'bg-[#ffffff] border-[#d9d4c9] text-[#6b6b6b] hover:border-[#b08d3e]/50');

// Discard buttons
content = content.replace(/bg-white\/5 text-\[#6b6b6b\] h-12 px-6 rounded-xl font-black uppercase tracking-widest text-\[10px\] hover:bg-white\/10 hover:text-\[#14110c\]/g, 'bg-[#ffffff] text-[#14110c] h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#e6e1d8] hover:text-[#14110c]');

content = content.replace(/bg-white\/5 text-\[#6b6b6b\] h-11 px-8 rounded-xl font-black uppercase tracking-widest text-\[10px\] hover:bg-white\/10 hover:text-\[#14110c\]/g, 'bg-[#ffffff] text-[#14110c] h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#e6e1d8] hover:text-[#14110c]');

// Table skeletons
content = content.replace(/bg-white\/5 rounded-2xl w-full/g, 'bg-[#e6e1d8]/50 rounded-2xl w-full');

// Option toggles
content = content.replace(/bg-white\/5 border-\[#d9d4c9\]/g, 'bg-[#ffffff] border-[#d9d4c9]');

// Remaining bg-white/5 to bg-[#ffffff]
content = content.replace(/bg-white\/5/g, 'bg-[#ffffff]');
content = content.replace(/bg-white\/10/g, 'bg-[#e6e1d8]');

// Also fix bg-blue-600 in the radio button to bg-[#b08d3e] (line 1201)
content = content.replace(/bg-blue-600/g, 'bg-[#b08d3e]');

// Focus rings
content = content.replace(/ring-blue-400\/50/g, 'ring-[#b08d3e]/50');

fs.writeFileSync(file, content);
console.log('Replacements completed.');
