const fs = require('fs');
const glob = require('glob');

const files = glob.sync('./components/**/*.tsx');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes('handleLogout')) {
    // Specifically target the window.location.href or router.push in handleLogout
    // We'll use regex to find handleLogout and replace the redirect
    
    // For general UI (not admin)
    if (!file.includes('AdminHeader')) {
      if (content.includes('window.location.href = "/";')) {
        content = content.replace(/window\.location\.href\s*=\s*['"]\/['"];/g, 'window.location.href = "/login";');
        changed = true;
      }
      if (content.includes("window.location.href = '/';")) {
        content = content.replace(/window\.location\.href\s*=\s*['"]\/['"];/g, "window.location.href = '/login';");
        changed = true;
      }
    } else {
      // For admin header, maybe it should go to /admin/login
      if (content.includes('window.location.href = "/";')) {
        content = content.replace(/window\.location\.href\s*=\s*['"]\/['"];/g, 'window.location.href = "/admin/login";');
        changed = true;
      }
      if (content.includes("window.location.href = '/';")) {
        content = content.replace(/window\.location\.href\s*=\s*['"]\/['"];/g, "window.location.href = '/admin/login';");
        changed = true;
      }
      if (content.includes("router.push('/admin/login')") || content.includes('router.push("/admin/login")')) {
        // already fine
      } else if (content.includes("router.push('/')") || content.includes('router.push("/")')) {
        content = content.replace(/router\.push\(['"]\/['"]\)/g, "router.push('/admin/login')");
        changed = true;
      }
    }
    
    if (changed) {
      fs.writeFileSync(file, content);
      console.log('Fixed logout redirect in', file);
    }
  }
}
