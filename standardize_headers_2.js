const fs = require('fs');

const files = [
  'app/admin/settings/page.tsx',
  'app/admin/enterprise-plan/[id]/page.tsx',
  'app/admin/reports/page.tsx',
  'app/admin/client-workspace/page.tsx',
  'app/admin/virtual-admins/page.tsx',
  'app/admin/scheduler-failures/page.tsx',
  'app/admin/coupons/page.tsx',
  'app/admin/coupons/[id]/usages/page.tsx',
  'app/admin/posts/page.tsx',
  'app/admin/submissions/page.tsx',
  'app/admin/faq/page.tsx',
  'app/admin/case-studies/page.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Replace <h1 ...>Title</h1>
  content = content.replace(/<h1 className="[^"]*text-(2xl|3xl)[^"]*">(\s*<[^>]+>\s*)?(.*?)<\/h1>/g, '<h1 className="text-2xl font-semibold text-[#14110c]">$3</h1>');
  
  // Replace <p ...>Subtitle</p> that follows
  // The structure is usually <h1 ...>Title</h1>\n <p className="...">Subtitle</p>
  // Let's replace any <p className="text-[sm,xs] text-[#6b6b6b]..."> with the standard
  content = content.replace(/(<h1 className="text-2xl font-semibold text-\[#14110c\]">.*?<\/h1>\s*)<p className="[^"]*text-\[#6b6b6b\][^"]*">/g, '$1<p className="text-sm text-[#6b6b6b]">');

  if (content !== fs.readFileSync(file, 'utf8')) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
