const fs = require('fs');
const newhomeCssPath = './app/(updatednewhomepage)/newhome/newhome.css';
const planCssPath = './app/(updatednewhomepage)/plan/plan.css';
const navbarCssPath = './components/newhome/Navbar.css';
const navbarTsxPath = './components/newhome/Navbar.tsx';

let newhomeCss = fs.readFileSync(newhomeCssPath, 'utf8');
let planCss = fs.readFileSync(planCssPath, 'utf8');

// Extract navigation CSS
const navStartRegex = /\/\* ==================== NAVIGATION ==================== \*\//;
const navEndRegexNewhome = /\/\* ==================== CONTAINERS ==================== \*\//;
const navEndRegexPlan = /\/\* ==================== PAGE HEADER ==================== \*\//;

const startIdx = newhomeCss.search(navStartRegex);
const endIdx = newhomeCss.search(navEndRegexNewhome);

if (startIdx !== -1 && endIdx !== -1) {
  const extractedNavCss = newhomeCss.substring(startIdx, endIdx).trim();
  fs.writeFileSync(navbarCssPath, extractedNavCss + '\n');
  
  // Remove from newhome.css
  newhomeCss = newhomeCss.replace(newhomeCss.substring(startIdx, endIdx), '');
  fs.writeFileSync(newhomeCssPath, newhomeCss);
  
  // Remove from plan.css
  const planStartIdx = planCss.search(navStartRegex);
  const planEndIdx = planCss.search(navEndRegexPlan);
  if (planStartIdx !== -1 && planEndIdx !== -1) {
    planCss = planCss.replace(planCss.substring(planStartIdx, planEndIdx), '');
    fs.writeFileSync(planCssPath, planCss);
  }
}

// Add import to Navbar.tsx
let navbarTsx = fs.readFileSync(navbarTsxPath, 'utf8');
if (!navbarTsx.includes("import './Navbar.css';")) {
  navbarTsx = navbarTsx.replace('import React, { useState, useRef, useEffect } from \'react\';', 'import React, { useState, useRef, useEffect } from \'react\';\nimport \'./Navbar.css\';');
  fs.writeFileSync(navbarTsxPath, navbarTsx);
}

console.log('CSS fixed');
