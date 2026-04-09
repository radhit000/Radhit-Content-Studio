const https = require('https');
https.get('https://openrouter.ai/api/v1/models', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const models = JSON.parse(data).data;
    const geminiImage = models.find(m => m.id === 'google/gemini-2.5-flash-image');
    console.log(JSON.stringify(geminiImage, null, 2));
  });
});
