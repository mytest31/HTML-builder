const fs = require('fs');
const path = require('path');
const { stdin, stdout } = process;

const OUTPUT_FILE_PATH = path.join(__dirname, './input.txt');
const OUTPUT_STREAM_OPTIONS = { flags: 'w' };
const outputStream = fs.createWriteStream(
  OUTPUT_FILE_PATH,
  OUTPUT_STREAM_OPTIONS,
);

stdout.write(
  'Hello!\n' +
    'Your text will be saved in "02-write-file/input.txt".\n' +
    'To exit, press CTRL + C or type "exit".\n' +
    'Please, enter your text here.\n',
);

stdin.on('data', (data) => {
  data.toString().trim() === 'exit' ? process.exit() : outputStream.write(data);
});
stdin.on('error', (err) => console.error(err.message));

process.on('SIGINT', () => process.exit());
process.on('exit', () => console.log('The script has stopped.\nBye!'));
