const fs = require('fs');
const file = 'app/admin/enterprise-plan/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<DialogContent className="/g, '<DialogContent contentClassName="p-0" className="');

fs.writeFileSync(file, content);
console.log('DialogContent updated to remove padding.');
