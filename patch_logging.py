import re

with open("server.ts", "r") as f:
    content = f.read()

# Replace the fetch call with logged fetch
old_fetch = r"""          const slip2goResponse = await fetch('https://connect.slip2go.com/api/verify-slip/qr-image/info', {
            method: 'POST',
            headers: {
              'x-api-key': process.env.SLIP2GO_API_KEY,
              'Authorization': `Bearer ${process.env.SLIP2GO_API_KEY}`
            },
            body: formData
          });"""

new_fetch = r"""          console.log('\n--- SLIP2GO API REQUEST ---');
          console.log('Endpoint: https://connect.slip2go.com/api/verify-slip/qr-image/info');
          console.log('Method: POST');
          console.log('Headers:');
          console.log(`  x-api-key: ${process.env.SLIP2GO_API_KEY ? '***' + process.env.SLIP2GO_API_KEY.slice(-4) : 'undefined'}`);
          console.log(`  Authorization: Bearer ${process.env.SLIP2GO_API_KEY ? '***' + process.env.SLIP2GO_API_KEY.slice(-4) : 'undefined'}`);
          console.log('Body: FormData with file ' + filename);
          console.log('---------------------------\n');
          const startTime = Date.now();
          const slip2goResponse = await fetch('https://connect.slip2go.com/api/verify-slip/qr-image/info', {
            method: 'POST',
            headers: {
              'x-api-key': process.env.SLIP2GO_API_KEY,
              'Authorization': `Bearer ${process.env.SLIP2GO_API_KEY}`
            },
            body: formData
          });
          const endTime = Date.now();
          console.log('\n--- SLIP2GO API RESPONSE ---');
          console.log(`Status Code: ${slip2goResponse.status}`);
          console.log(`Response Time: ${endTime - startTime}ms`);
          console.log('Response Headers:', Object.fromEntries(slip2goResponse.headers.entries()));
          console.log('----------------------------\n');"""

content = content.replace(old_fetch, new_fetch)

with open("server.ts", "w") as f:
    f.write(content)
print("done")
