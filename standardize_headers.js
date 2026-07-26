const fs = require('fs');

const files = [
  'app/admin/page.tsx',
  'app/admin/virtual-admins/page.tsx',
  'app/admin/case-studies/page.tsx',
  'app/admin/posts/page.tsx',
  'app/admin/support-system/page.tsx',
  'app/admin/submissions/page.tsx',
  'app/admin/faq/page.tsx',
  'app/admin/client-workspace/page.tsx',
  'app/admin/subscriptions/page.tsx',
  'app/admin/reports/page.tsx',
  'app/admin/users/[id]/page.tsx',
  'app/admin/users/[id]/calendar/page.tsx',
  'app/admin/coupons/page.tsx',
  'app/admin/coupons/[id]/usages/page.tsx',
  'app/admin/enterprise-plan/page.tsx',
  'app/admin/enterprise-plan/[id]/page.tsx',
  'app/admin/settings/page.tsx',
  'app/admin/media/page.tsx',
  'app/admin/scheduler-failures/page.tsx',
  'app/admin/session-schedule/page.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // We want to replace the first <h1> and the following <p> classes with the standardized ones.
  // We'll just look for the first <h1 ...> and <p ...> in the file.
  // Actually, some pages have <h1> with extra text, some have icons.
  // Let's manually write out the replacements for the tricky ones.
  
  if (file === 'app/admin/page.tsx') {
    content = content.replace(/<h1 className="text-2xl font-semibold text-\[#14110c\]">/g, '<h1 className="text-2xl font-semibold text-[#14110c]">');
    // page.tsx already matches
  } else if (file === 'app/admin/support-system/page.tsx') {
    // Remove the icon div, update h1 and p
    content = content.replace(/<div className="flex items-center gap-4">\s*<div className="h-12 w-12 rounded-2xl bg-\[#b08d3e\]\/10 flex items-center justify-center border border-\[#b08d3e\]\/20 shadow-lg shadow-lime-400\/5">\s*<MessageSquare className="h-6 w-6 text-\[#b08d3e\]" \/>\s*<\/div>\s*<div>\s*<h1 className="text-3xl font-bold text-\[#14110c\] tracking-tight">\s*(.*?)\s*<\/h1>\s*<p className="text-\[#6b6b6b\] text-sm mt-1">\s*(.*?)\s*<\/p>\s*<\/div>\s*<\/div>/g, 
    `<div>
          <h1 className="text-2xl font-semibold text-[#14110c]">$1</h1>
          <p className="text-sm text-[#6b6b6b]">$2</p>
        </div>`);
  } else if (file === 'app/admin/enterprise-plan/page.tsx') {
    content = content.replace(/<div className="flex items-center gap-3 mb-1">\s*<div className="h-10 w-10 rounded-2xl bg-\[#b08d3e\] flex items-center justify-center text-\[#14110c\] shadow-\[0_0_20px_rgba\(163,230,53,0\.3\)\]">\s*<ShieldCheck className="h-6 w-6" \/>\s*<\/div>\s*<h1 className="text-3xl font-black text-\[#14110c\] tracking-tight">(.*?)<\/h1>\s*<\/div>\s*<p className="text-\[#6b6b6b\] text-sm font-medium ml-1">\s*(.*?)\s*<\/p>/g,
    `<h1 className="text-2xl font-semibold text-[#14110c]">$1</h1>
          <p className="text-sm text-[#6b6b6b]">$2</p>`);
  } else if (file === 'app/admin/subscriptions/page.tsx') {
    content = content.replace(/<h1 className="text-3xl font-bold text-\[#14110c\] tracking-tight">(.*?)<\/h1>\s*<p className="text-\[#6b6b6b\] text-sm mt-1">\s*(.*?)\s*<\/p>/g,
    `<h1 className="text-2xl font-semibold text-[#14110c]">$1</h1>
          <p className="text-sm text-[#6b6b6b]">$2</p>`);
  } else if (file === 'app/admin/virtual-admins/page.tsx') {
    content = content.replace(/<h1 className="text-3xl font-black text-\[#14110c\] flex items-center gap-3 tracking-tight">\s*(.*?)\s*<\/h1>\s*<p className="text-\[#6b6b6b\] text-sm mt-1 font-medium">\s*(.*?)\s*<\/p>/g,
    `<h1 className="text-2xl font-semibold text-[#14110c]">$1</h1>
          <p className="text-sm text-[#6b6b6b]">$2</p>`);
  } else if (file === 'app/admin/case-studies/page.tsx') {
    content = content.replace(/<h1 className="text-2xl font-bold text-\[#14110c\]">(.*?)<\/h1>\s*<p className="text-sm text-\[#6b6b6b\] mt-1">(.*?)<\/p>/g,
    `<h1 className="text-2xl font-semibold text-[#14110c]">$1</h1>
          <p className="text-sm text-[#6b6b6b]">$2</p>`);
  } else if (file === 'app/admin/posts/page.tsx') {
    content = content.replace(/<h1 className="text-2xl font-semibold text-\[#14110c\]">(.*?)<\/h1>\s*<p className="text-sm text-\[#6b6b6b\] mt-1">(.*?)<\/p>/g,
    `<h1 className="text-2xl font-semibold text-[#14110c]">$1</h1>
          <p className="text-sm text-[#6b6b6b]">$2</p>`);
  } else if (file === 'app/admin/submissions/page.tsx') {
    content = content.replace(/<h1 className="text-2xl font-bold text-\[#14110c\]">(.*?)<\/h1>\s*<p className="text-\[#6b6b6b\] text-sm mt-1">(.*?)<\/p>/g,
    `<h1 className="text-2xl font-semibold text-[#14110c]">$1</h1>
          <p className="text-sm text-[#6b6b6b]">$2</p>`);
  } else if (file === 'app/admin/faq/page.tsx') {
    content = content.replace(/<h1 className="text-2xl font-bold text-\[#14110c\] flex items-center gap-2">\s*(.*?)\s*<\/h1>\s*<p className="text-\[#6b6b6b\] text-sm mt-1">\s*(.*?)\s*<\/p>/g,
    `<h1 className="text-2xl font-semibold text-[#14110c]">$1</h1>
          <p className="text-sm text-[#6b6b6b]">$2</p>`);
  } else if (file === 'app/admin/client-workspace/page.tsx') {
    content = content.replace(/<h1 className="text-3xl font-black text-\[#14110c\] tracking-tight">\s*(.*?)\s*<\/h1>\s*<p className="text-\[#6b6b6b\] text-sm font-medium">\s*(.*?)\s*<\/p>/g,
    `<h1 className="text-2xl font-semibold text-[#14110c]">$1</h1>
          <p className="text-sm text-[#6b6b6b]">$2</p>`);
  } else if (file === 'app/admin/reports/page.tsx') {
    content = content.replace(/<h1 className="text-3xl font-bold text-\[#14110c\] mb-2">(.*?)<\/h1>\s*<p className="text-\[#6b6b6b\] text-sm">\s*(.*?)\s*<\/p>/g,
    `<h1 className="text-2xl font-semibold text-[#14110c]">$1</h1>
          <p className="text-sm text-[#6b6b6b]">$2</p>`);
  } else if (file === 'app/admin/coupons/page.tsx') {
    content = content.replace(/<h1 className="text-2xl font-bold text-\[#14110c\] flex items-center gap-2">\s*<Ticket className="h-6 w-6 text-\[#b08d3e\]" \/>\s*(.*?)\s*<\/h1>\s*<p className="text-sm text-\[#6b6b6b\] mt-1">\s*(.*?)\s*<\/p>/g,
    `<h1 className="text-2xl font-semibold text-[#14110c]">$1</h1>
          <p className="text-sm text-[#6b6b6b]">$2</p>`);
  } else if (file === 'app/admin/scheduler-failures/page.tsx') {
    content = content.replace(/<h1 className="text-2xl font-semibold text-\[#14110c\] flex items-center gap-2">\s*<AlertCircle className="h-6 w-6 text-red-500" \/>\s*(.*?)\s*<\/h1>\s*<p className="text-sm text-\[#6b6b6b\] mt-1">(.*?)<\/p>/g,
    `<h1 className="text-2xl font-semibold text-[#14110c]">$1</h1>
          <p className="text-sm text-[#6b6b6b]">$2</p>`);
  }

  // We should also ensure the `mt-1` or `font-bold` etc are stripped out properly, 
  // replacing them globally with the standard text.
  
  if (content !== fs.readFileSync(file, 'utf8')) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}

console.log('Header standardization pass 1 complete.');
