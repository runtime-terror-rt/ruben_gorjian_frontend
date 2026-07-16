import re

with open('app/(updatednewhomepage)/brandbrief.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract CSS
style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
css_content = style_match.group(1) if style_match else ""

with open('app/(updatednewhomepage)/brandbrief/brandbrief.css', 'w', encoding='utf-8') as f:
    f.write(css_content.strip())

# Extract Body
body_match = re.search(r'<body>(.*?)<script>', content, re.DOTALL)
if body_match:
    body_content = body_match.group(1)
else:
    body_match = re.search(r'<body>(.*?)</body>', content, re.DOTALL)
    body_content = body_match.group(1) if body_match else content

jsx = body_content

# Replace class -> className
jsx = re.sub(r'\bclass=', 'className=', jsx)

# Replace for -> htmlFor
jsx = re.sub(r'\bfor=', 'htmlFor=', jsx)

# Replace style="..."
def style_replacer(match):
    style_str = match.group(1)
    styles = {}
    for declaration in style_str.split(';'):
        if ':' in declaration:
            prop, val = declaration.split(':', 1)
            prop = prop.strip()
            val = val.strip()
            # camelCase property
            prop = re.sub(r'-([a-z])', lambda m: m.group(1).upper(), prop)
            styles[prop] = val
            
    # Format as string dictionary
    dict_str = ", ".join(f"'{k}': '{v}'" for k, v in styles.items())
    return f"style={{{{{dict_str}}}}}"

jsx = re.sub(r'style="([^"]*)"', style_replacer, jsx)

# Self-close inputs, imgs, br, hr
jsx = re.sub(r'<input([^>]*[^/])>', r'<input\1 />', jsx)
jsx = re.sub(r'<img([^>]*[^/])>', r'<img\1 />', jsx)
jsx = re.sub(r'<br>', r'<br />', jsx)
jsx = re.sub(r'<hr>', r'<hr />', jsx)

# Handle checked -> defaultChecked
jsx = re.sub(r'\bchecked\b', 'defaultChecked', jsx)

# Fix comments <!-- ... --> to {/* ... */}
jsx = re.sub(r'<!--(.*?)-->', r'{/*\1*/}', jsx, flags=re.DOTALL)

# Handle select -> defaultValue if needed, but not strictly necessary for uncontrolled.

# We need to wrap it in the component and handle the state for birthstoneDetail
component = f"""
"use client";
import React, {{{{ useState }}}} from 'react';
import './brandbrief.css';

export default function BrandBriefPage() {{
  const [showBirthstoneDetail, setShowBirthstoneDetail] = useState(false);

  return (
    <div className="brandbrief-wrapper">
      {jsx}
    </div>
  );
}}
"""

# Replace the static JS logic with dynamic React logic for birthstone
# Find id="bs_yes" and id="bs_no" to attach onChange
component = component.replace(
    'id="bs_yes"',
    'id="bs_yes" onChange={() => setShowBirthstoneDetail(true)}'
)
component = component.replace(
    'id="bs_no"',
    'id="bs_no" onChange={() => setShowBirthstoneDetail(false)}'
)
# Update birthstoneDetail class based on state
component = component.replace(
    'id="birthstoneDetail"',
    'id="birthstoneDetail" className={`birthstone-detail ${showBirthstoneDetail ? "active" : ""}`}'
)
component = component.replace(
    'className="birthstone-detail" id="birthstoneDetail" className={`birthstone-detail ${showBirthstoneDetail ? "active" : ""}`}',
    'id="birthstoneDetail" className={`birthstone-detail ${showBirthstoneDetail ? "active" : ""}`}'
)

# Any required attribute with nothing after it (boolean) like required -> required={true} or just required
# Next.js / React handles `required` as boolean correctly.

with open('app/(updatednewhomepage)/brandbrief/page.tsx', 'w', encoding='utf-8') as f:
    f.write(component)

print("Conversion complete.")
