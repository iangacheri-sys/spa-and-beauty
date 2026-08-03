const https = require('https');
const fs = require('fs');
https.get('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=exp://192.168.8.39:8081', (res) => res.pipe(fs.createWriteStream('C:/Users/admin/.gemini/antigravity-ide/brain/5dfe29a8-26f3-4b8e-baaa-967819f6c1de/expo_qr_code.png')));
