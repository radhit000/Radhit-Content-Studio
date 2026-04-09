const https = require('https');
https.get('https://openrouter.ai/api/v1/models', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const models = JSON.parse(data).data;
    console.log(models.map(m => m.id).filter(id => id.includes('image')));
  });
});
