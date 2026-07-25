const fs = require('fs');
const path = require('path');

const logPath = '/home/ashim/.gemini/antigravity/brain/551debbf-5408-4edb-953d-aa0c38f18c54/.system_generated/logs/overview.txt';

const targetFiles = [
  "components/dashboard/DashboardLayout.tsx",
  "components/dashboard/DashboardHeader.tsx",
  "components/admin/AdminLayout.tsx",
  "components/admin/AdminHeader.tsx",
  "components/admin/AdminSidebar.tsx",
  "app/dashboard/page.tsx",
  "app/dashboard/billing/page.tsx",
  "app/dashboard/settings/page.tsx",
  "app/dashboard/media/page.tsx",
  "app/dashboard/calendar/enhanced-calendar.tsx",
  "components/google-login-button.tsx"
];

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
const latestReplacements = {};

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const entry = JSON.parse(line);
    if (entry.tool_calls) {
      for (const call of entry.tool_calls) {
        if (call.name === 'multi_replace_file_content' || call.name === 'replace_file_content') {
          let targetFile = call.args.TargetFile;
          // Unescape the target file path
          if (targetFile && typeof targetFile === 'string') {
              if (targetFile.startsWith('"') && targetFile.endsWith('"')) {
                  targetFile = targetFile.slice(1, -1);
              }
              const isTarget = targetFiles.some(tf => targetFile.endsWith(tf));
              if (isTarget) {
                  latestReplacements[targetFile] = call;
              }
          }
        }
      }
    }
  } catch (e) {
    // ignore
  }
}

for (const [file, call] of Object.entries(latestReplacements)) {
  console.log("Restoring:", file);
  try {
    let content = fs.readFileSync(file, 'utf8');
    let lines = content.split('\n');
    
    if (call.name === 'multi_replace_file_content') {
      let chunksStr = call.args.ReplacementChunks;
      if (typeof chunksStr === 'string') {
          // Unescape and parse
          if (chunksStr.startsWith('"') && chunksStr.endsWith('"')) {
              // Try to unescape double quotes and newlines
              try {
                chunksStr = JSON.parse(chunksStr); // parse the JSON encoded string
              } catch (e) {
                 console.log("Error decoding string", e);
              }
          }
          if (typeof chunksStr === 'string') {
              chunksStr = JSON.parse(chunksStr);
          }
      }
      
      const chunks = chunksStr;
      
      // Sort chunks by StartLine descending so we can apply them safely from bottom to top
      chunks.sort((a, b) => b.StartLine - a.StartLine);
      
      for (const chunk of chunks) {
        const start = chunk.StartLine - 1;
        const end = chunk.EndLine; // end is exclusive in slice, but the chunk specifies 1-indexed inclusive end
        const replacementLines = chunk.ReplacementContent.split('\n');
        
        // Replace lines
        lines.splice(start, end - start, ...replacementLines);
      }
    } else if (call.name === 'replace_file_content') {
        const start = parseInt(call.args.StartLine) - 1;
        const end = parseInt(call.args.EndLine);
        const replacementContent = call.args.ReplacementContent;
        let actualContent = replacementContent;
        if (typeof replacementContent === 'string' && replacementContent.startsWith('"') && replacementContent.endsWith('"')) {
            try {
                actualContent = JSON.parse(replacementContent);
            } catch(e) {}
        }
        
        const replacementLines = actualContent.split('\n');
        lines.splice(start, end - start, ...replacementLines);
    }
    
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    console.log("Successfully restored", file);
  } catch (e) {
    console.error("Failed to restore", file, e.message);
  }
}
