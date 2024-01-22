const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'text.txt');
const input = fs.createReadStream(inputPath, 'utf-8');

let text = '';
input.on('data', (data) => {
  text += data;
});
input.on('end', () => console.log(text));
