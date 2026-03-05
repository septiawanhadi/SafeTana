import https from 'https';

https.get('https://api-berita-indonesia.vercel.app/antara/terbaru/', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(data.substring(0, 500)));
}).on('error', (err) => console.log('Error:', err.message));
