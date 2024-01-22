const fs = require('fs');
const path = require('path');

const DIRECTORY_NAME = 'secret-folder';
const DIRECTORY_ABSOLUTE_PATH = path.join(__dirname, DIRECTORY_NAME);
const READDIR_OPTIONS = {
  withFileTypes: true,
};

function displayFilesInfo(absolutePath, readdir_options) {
  fs.readdir(absolutePath, readdir_options, (error, dirContent) => {
    if (error) return console.error(error.message);

    const files = dirContent.filter((file) => file.isFile());

    files.forEach((file) => {
      let fileExtension = path.extname(file.name);
      const fileName = path.basename(file.name, fileExtension);

      // remove . at the beginning of the extension name
      fileExtension = fileExtension.length > 0 ? fileExtension.slice(1) : '';

      const fileAbsolutePath = path.join(file.path, file.name);
      fs.stat(fileAbsolutePath, (error, stats) => {
        if (error) return console.error(error.message);

        console.log(
          `${fileName}\t${fileExtension}\t${(stats.size / 1024).toFixed(3)} kB`,
        );
      });
    });
  });
}

displayFilesInfo(DIRECTORY_ABSOLUTE_PATH, READDIR_OPTIONS);
