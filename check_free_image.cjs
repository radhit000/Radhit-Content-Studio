const https = require('https');
https.get('https://openrouter.ai/api/v1/models', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const models = JSON.parse(data).data;
    const freeImageModels = models.filter(m => 
      m.pricing && m.pricing.prompt === "0" && m.pricing.completion === "0" && 
      m.architecture?.modality && m.architecture.modality.includes('image') && m.architecture.modality.includes('->image')
    );
    console.log(JSON.stringify(freeImageModels.map(m => m.id), null, 2));
  });
});
