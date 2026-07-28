const fs = require('fs');
const planCssPath = './app/(updatednewhomepage)/plan/plan.css';

let css = fs.readFileSync(planCssPath, 'utf8');

// The original string in plan.css
const searchString = `.talexia-wrapper .rule-ornament {
  width: 60px;
  height: 1px;
  background: #b08d3e;
  position: relative;
  margin: 0 auto 28px;
}`;

// The new string
const replacementString = `.talexia-wrapper .rule-ornament {
  width: 60px;
  height: 1px;
  background: #b08d3e;
  position: relative;
  margin: 0 0 28px;
}

.talexia-wrapper .rule-ornament.center {
  margin: 0 auto 28px;
}`;

if (css.includes(searchString)) {
  css = css.replace(searchString, replacementString);
  fs.writeFileSync(planCssPath, css);
  console.log('Fixed rule-ornament CSS in plan.css');
} else {
  console.log('Search string not found, doing regex replacement...');
  const regex = /(\.talexia-wrapper \.rule-ornament\s*\{[^}]*)margin:\s*0 auto 28px;([^}]*\})/g;
  if (regex.test(css)) {
    css = css.replace(regex, "$1margin: 0 0 28px;$2\n\n.talexia-wrapper .rule-ornament.center {\n  margin: 0 auto 28px;\n}");
    fs.writeFileSync(planCssPath, css);
    console.log('Fixed using regex');
  } else {
    console.log('Could not find matching CSS to replace.');
  }
}
