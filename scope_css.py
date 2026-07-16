import re

with open('app/(updatednewhomepage)/brandbrief/brandbrief.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Simple scoping: prepend .brandbrief-wrapper to every rule.
# To avoid a complex CSS parser, we can just look for the start of lines or things before '{'.
# Since the CSS is well-formatted from the HTML block:
def scope_selector(match):
    selectors = match.group(1).split(',')
    scoped_selectors = []
    for sel in selectors:
        sel = sel.strip()
        if sel in ['*', 'body', 'html']:
            # For *, body, html, replace them entirely or scope them
            scoped_selectors.append(f".brandbrief-wrapper")
        elif sel.startswith('@media'):
            return f"{sel} {{"
        else:
            scoped_selectors.append(f".brandbrief-wrapper {sel}")
    return ",\n".join(scoped_selectors) + " {"

# This regex is very simplistic but works for the CSS in brandbrief.html
# We match everything before a '{' that isn't a comment.
# Wait, better to just use a small regex carefully.
lines = css.split('\n')
scoped_lines = []
in_media = False
for line in lines:
    if line.strip().startswith('/*'):
        scoped_lines.append(line)
        continue
    
    # Check if line contains a '{' (selector line)
    if '{' in line and not line.strip().startswith('@media'):
        parts = line.split('{')
        selector_part = parts[0]
        rest = '{'.join(parts[1:])
        
        selectors = selector_part.split(',')
        new_selectors = []
        for sel in selectors:
            sel = sel.strip()
            if not sel: continue
            if sel in ['*', 'body', 'html']:
                new_selectors.append(f".brandbrief-wrapper")
            else:
                new_selectors.append(f".brandbrief-wrapper {sel}")
        
        scoped_lines.append(", ".join(new_selectors) + " {" + rest)
    elif line.strip().startswith('@media'):
        scoped_lines.append(line)
        in_media = True
    else:
        scoped_lines.append(line)

with open('app/(updatednewhomepage)/brandbrief/brandbrief.css', 'w', encoding='utf-8') as f:
    f.write('\n'.join(scoped_lines))

print("CSS Scoped.")
