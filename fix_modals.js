const fs = require('fs');
const file = 'app/admin/enterprise-plan/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Inputs - add placeholder styling
content = content.replace(/text-sm"/g, 'text-sm placeholder:text-[#6b6b6b] placeholder:font-normal"');

// 2. Radio/checkbox unselected items
content = content.replace(/bg-\[#ffffff\] border-\[#d9d4c9\] text-\[#6b6b6b\] hover:border-\[#b08d3e\]\/50/g, 'bg-[#ffffff] shadow-sm border-[#d9d4c9] text-[#6b6b6b] hover:border-[#b08d3e]/50 hover:shadow-md');

// 3. Edit modal icon
content = content.replace(/text-blue-600 border border-blue-500\/20/g, 'text-[#b08d3e] border border-[#b08d3e]/20');

// 4. Update Button in Edit Modal
content = content.replace(/bg-blue-500 hover:bg-\[#b08d3e\]/g, 'bg-[#b08d3e] hover:bg-[#e6e1d8]');
content = content.replace(/rgba\(59,130,246,0\.3\)/g, 'rgba(176,141,62,0.3)');
// Pulse dot
content = content.replace(/bg-blue-500 animate-pulse/g, 'bg-emerald-500 animate-pulse');

// 5. Brand Brief Modal Colors
content = content.replace(/text-blue-600/g, 'text-[#b08d3e]');
content = content.replace(/text-indigo-600/g, 'text-[#b08d3e]');
content = content.replace(/bg-indigo-600\/10/g, 'bg-[#b08d3e]/10');
content = content.replace(/text-amber-700/g, 'text-[#b08d3e]');
content = content.replace(/bg-amber-500\/10/g, 'bg-[#b08d3e]/10');
content = content.replace(/text-rose-400/g, 'text-[#b08d3e]');
content = content.replace(/bg-rose-400\/10/g, 'bg-[#b08d3e]/10');
content = content.replace(/bg-white\/\[0\.02\]/g, 'bg-[#ffffff] shadow-sm');

// Also make sure text areas have proper placeholder style
content = content.replace(/placeholder:text-\[#14110c\]/g, 'placeholder:text-[#6b6b6b] placeholder:font-normal');

// One more check on edit inputs having ring-blue-400/50 - convert to ring-[#b08d3e]/50
content = content.replace(/ring-blue-400\/50/g, 'ring-[#b08d3e]/50');

fs.writeFileSync(file, content);
console.log('Modals updated.');
