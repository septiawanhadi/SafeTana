const https = require('https');

https.get('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=-7.3032412&longitude=110.0044145&localityLanguage=id', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log("Reverse geocode result:", json.locality, json.principalSubdivision, json.city);
      console.log("Full json:", json);
    } catch (e) {
      console.error("Error:", e.message);
    }
  });
}).on('error', err => {
  console.error("Error:", err.message);
});
