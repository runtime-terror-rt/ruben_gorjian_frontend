const fs = require('fs');
const planCssPath = './app/(updatednewhomepage)/plan/plan.css';

let css = fs.readFileSync(planCssPath, 'utf8');

// Replace the generic .btn width/display with a scoped one
const searchString = `.talexia-wrapper .btn {
  display: inline-block;
  text-decoration: none;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 11.5px;
  letter-spacing: 2px;
  text-transform: uppercase;
  padding: 15px 30px;
  font-weight: 600;
  border-radius: 2px;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  width: 100%;
  text-align: center;
  display: block;
}`;

const replacementString = `.talexia-wrapper .btn {
  display: inline-block;
  text-decoration: none;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 11.5px;
  letter-spacing: 2px;
  text-transform: uppercase;
  padding: 15px 30px;
  font-weight: 600;
  border-radius: 2px;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  text-align: center;
}

.talexia-wrapper .plan-card .btn {
  width: 100%;
  display: block;
}`;

if (css.includes(searchString)) {
  css = css.replace(searchString, replacementString);
  fs.writeFileSync(planCssPath, css);
  console.log('Fixed btn CSS in plan.css');
} else {
  console.log('Search string not found, falling back to regex replace...');
  // Fallback regex to just strip width: 100%; and display: block; from .talexia-wrapper .btn { ... }
  const regex = /(\.talexia-wrapper \.btn\s*\{[^}]*)width:\s*100%;([^}]*)display:\s*block;([^}]*\})/g;
  if (regex.test(css)) {
    css = css.replace(regex, "$1$2$3\n\n.talexia-wrapper .plan-card .btn {\n  width: 100%;\n  display: block;\n}");
    fs.writeFileSync(planCssPath, css);
    console.log('Fixed using regex');
  } else {
    console.log('Could not find matching CSS to replace.');
  }
}
