import fs from 'fs';
import https from 'https';

const url = 'https://upload.wikimedia.org/wikipedia/id/5/5e/Logo_Perum_Jasa_Tirta_II.png';
const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
  }
};

https.get(url, options, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to download: Status Code ${res.statusCode}`);
    return;
  }
  const chunks: any[] = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    const base64 = buffer.toString('base64');
    console.log('Successfully downloaded image. Base64 length:', base64.length);
    fs.writeFileSync('./src/logo-base64.txt', base64);
    console.log('Successfully written to ./src/logo-base64.txt');
  });
}).on('error', (err) => {
  console.error('Error during https request:', err);
});
