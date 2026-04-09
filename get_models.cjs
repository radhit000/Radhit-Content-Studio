const https = require('https');
const data = JSON.stringify({
  model: 'google/gemini-2.5-flash-image',
  messages: [{ role: 'user', content: 'A cat' }]
});

const req = https.request('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk-or-v1-test' // I can't test without a real key
  }
}, (res) => {
  let resData = '';
  res.on('data', (chunk) => { resData += chunk; });
  res.on('end', () => {
    console.log(resData);
  });
});
req.write(data);
req.end();
