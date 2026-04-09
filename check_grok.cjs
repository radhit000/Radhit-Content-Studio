const https = require('https');
https.get('https://openrouter.ai/api/v1/models', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const models = JSON.parse(data).data;
    const grokModels = models.filter(m => m.id.toLowerCase().includes('grok'));
    console.log(JSON.stringify(grokModels.map(m => ({ id: m.id, pricing: m.pricing, modalities: m.architecture?.modality })), null, 2));
  });
});
