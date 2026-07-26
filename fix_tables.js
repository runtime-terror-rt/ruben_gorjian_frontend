const fs = require('fs');

const file = 'app/admin/enterprise-plan/page.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf-8');

  // Replace Table Card Wrappers
  content = content.replaceAll(
    'className="border-white/5 bg-[#faf8f3] backdrop-blur-xl overflow-hidden rounded-[2rem] shadow-2xl"',
    'className="rounded-xl border border-[#d9d4c9] bg-[#ffffff] overflow-hidden"'
  );

  // Replace TableHeaders
  content = content.replaceAll(
    'className="bg-[#ffffff]/60 border-b border-white/5"',
    'className="bg-[#e6e1d8]/50"'
  );

  // Replace TableRow (headers)
  content = content.replaceAll(
    'className="hover:bg-transparent border-none"',
    'className="hover:bg-transparent border-[#d9d4c9]"'
  );

  // Replace TableRow (body) - Loading skeletons
  content = content.replaceAll(
    'className="border-white/5 animate-pulse hover:bg-transparent"',
    'className="border-[#d9d4c9] animate-pulse hover:bg-transparent"'
  );
  content = content.replaceAll(
    'className="border-white/5 animate-pulse"',
    'className="border-[#d9d4c9] animate-pulse"'
  );

  // Replace TableRow (body) - Actual rows
  content = content.replaceAll(
    'className="border-white/5 hover:bg-white/[0.03] transition-all group border-b last:border-b-0 cursor-pointer"',
    'className="border-[#d9d4c9] hover:bg-[#e6e1d8]/30 transition-colors group cursor-pointer"'
  );
  content = content.replaceAll(
    'className="border-white/5 hover:bg-white/[0.03] transition-all group border-b last:border-b-0"',
    'className="border-[#d9d4c9] hover:bg-[#e6e1d8]/30 transition-colors group"'
  );
  
  // Replace filter input styles in enterprise-plan
  content = content.replaceAll(
    'className="pl-11 bg-transparent border-none focus-visible:ring-0 h-10 text-sm text-[#14110c] placeholder:text-[#6b6b6b] font-medium"',
    'className="pl-11 bg-[#faf8f3] shadow-sm border border-[#d9d4c9] rounded-md focus-visible:ring-[#b08d3e]/50 h-11 text-sm text-[#14110c] placeholder:text-[#6b6b6b] font-medium"'
  );
  content = content.replaceAll(
    'className="bg-[#e6e1d8]/80 border-white/5 h-9 w-full lg:w-44 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#14110c] px-3 outline-none"',
    'className="bg-[#faf8f3] shadow-sm border border-[#d9d4c9] rounded-md h-11 w-full lg:w-44 text-[10px] font-black uppercase tracking-widest text-[#14110c] px-3 outline-none"'
  );
  // Also remove the wrapper styling that made it look weird in enterprise plan:
  content = content.replaceAll(
    'className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-[#ffffff]/60 p-2 rounded-[1.5rem] border border-white/5 backdrop-blur-md"',
    'className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-[#ffffff] p-4 rounded-xl border border-[#d9d4c9] shadow-sm"'
  );

  fs.writeFileSync(file, content, 'utf-8');
  console.log('Fixed enterprise-plan table and filter styles.');
}
