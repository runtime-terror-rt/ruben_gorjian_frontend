const fs = require('fs');
const file = 'app/admin/enterprise-plan/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The three headers have this common structure:
// bg-gradient-to-br from-[#14110c]/20 to-transparent border-b border-[#d9d4c9] ...

// Create and Edit modals have "relative overflow-hidden"
content = content.replace(/bg-gradient-to-br from-\[#14110c\]\/20 to-transparent border-b border-\[#d9d4c9\] relative overflow-hidden/g, 'bg-gradient-to-br from-[#14110c]/20 to-transparent border-b border-[#d9d4c9] relative overflow-hidden rounded-t-[2rem]');

// Brand Brief Details modal has "flex items-center justify-between"
content = content.replace(/px-8 py-6 bg-gradient-to-br from-\[#14110c\]\/20 to-transparent border-b border-\[#d9d4c9\] flex items-center justify-between/g, 'px-8 py-6 bg-gradient-to-br from-[#14110c]/20 to-transparent border-b border-[#d9d4c9] flex items-center justify-between rounded-t-[2.5rem]'); // Note: DialogContent has rounded-[2.5rem] for this one!

fs.writeFileSync(file, content);
console.log('Modal headers rounded updated.');
