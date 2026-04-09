const https = require('https');
https.get('https://openrouter.ai/api/v1/models', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const models = JSON.parse(data).data;
    const freeModels = models.filter(m => 
      m.pricing && m.pricing.prompt === "0" && m.pricing.completion === "0"
    );
    const imageGenModels = models.filter(m => 
      m.architecture?.modality && (m.architecture.modality.includes('->image') || m.architecture.modality.includes('->text+image'))
    );
    console.log("Free models count:", freeModels.length);
    console.log("Image gen models count:", imageGenModels.length);
    console.log("Free image gen models:", imageGenModels.filter(m => m.pricing && m.pricing.prompt === "0" && m.pricing.completion === "0").map(m => m.id));
  });
});
