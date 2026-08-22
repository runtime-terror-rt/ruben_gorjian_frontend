const fs = require('fs');

async function testUpload() {
  try {
    const fileContent = fs.readFileSync('package.json');
    const blob = new Blob([fileContent], { type: 'application/json' });
    const formData = new FormData();
    formData.append('userId', 'testUserId123');
    formData.append('file', blob, 'package.json');

    const res = await fetch('http://localhost:3000/api/scheduler/bulk/preview', {
      method: 'POST',
      body: formData,
    });

    const text = await res.text();
    fs.writeFileSync('test_response.txt', `Status: ${res.status}\nBody: ${text}`);
    console.log('Done writing response');
  } catch (err) {
    console.error(err);
  }
}

testUpload();
