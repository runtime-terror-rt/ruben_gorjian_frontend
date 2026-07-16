import re

with open('app/(updatednewhomepage)/brandbrief.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract body or the main wrapper
match = re.search(r'<div class="talexia-wrapper">(.*?)<footer', content, re.DOTALL)
if not match:
    # try another way
    match = re.search(r'<body[^>]*>(.*?)</body>', content, re.DOTALL)
    body = match.group(1)
else:
    body = match.group(1)

# Remove nav
body = re.sub(r'<nav.*?</nav>', '', body, flags=re.DOTALL)

# Convert HTML to JSX
jsx = body.replace('class=', 'className=')
jsx = jsx.replace('for=', 'htmlFor=')

# Self closing tags
jsx = re.sub(r'<input([^>]*)(?<!/)>', r'<input\1 />', jsx)
jsx = re.sub(r'<img([^>]*)(?<!/)>', r'<img\1 />', jsx)
jsx = re.sub(r'<br([^>]*)(?<!/)>', r'<br\1 />', jsx)
jsx = re.sub(r'<hr([^>]*)(?<!/)>', r'<hr\1 />', jsx)

# Convert inline styles (heuristic, might need manual fix)
# style="color: #8a6d28;" -> style={{ color: '#8a6d28' }}
def style_replacer(m):
    styles = m.group(1).strip()
    if not styles: return 'style={{}}'
    style_dict = []
    for s in styles.split(';'):
        if ':' in s:
            k, v = s.split(':', 1)
            k = k.strip()
            v = v.strip()
            # camelCase key
            parts = k.split('-')
            k = parts[0] + ''.join(p.capitalize() for p in parts[1:])
            style_dict.append(f"{k}: '{v}'")
    return "style={{ " + ", ".join(style_dict) + " }}"

jsx = re.sub(r'style="([^"]*)"', style_replacer, jsx)

# Convert HTML comments to JSX comments
jsx = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', jsx, flags=re.DOTALL)

# Handle select/option selected
jsx = jsx.replace('selected>', 'defaultValue>').replace('selected ', 'defaultValue ')
jsx = jsx.replace('checked>', 'defaultChecked>').replace('checked ', 'defaultChecked ')
jsx = jsx.replace('required>', 'required>').replace('required ', 'required ')

# Output to TSX
out = """import React from 'react';
import Navbar from '@/components/newhome/Navbar';
import Footer from '@/components/newhome/Footer';
import '../newhome/newhome.css';
import './brandbrief.css';

export const metadata = {
  title: 'Brand Brief — Talexia',
  description: 'Talexia Brand Brief',
};

export default function BrandBriefPage() {
  return (
    <div className="talexia-wrapper">
      <Navbar />
      %s
      <Footer />
    </div>
  );
}
""" % jsx

with open('app/(updatednewhomepage)/brandbrief/page.tsx', 'w', encoding='utf-8') as f:
    f.write(out)

print("Converted!")
