const https = require('https');
https.get('https://openrouter.ai/docs/features/multimodal/image-generation', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(data.substring(0, 1000));
  });
});
