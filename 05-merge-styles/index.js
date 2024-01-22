const fs = require('fs');
const path = require('path');

const PROJECT_FOLDER = 'project-dist';
const ABSOLUTE_PROJECT_FOLDER = path.join(__dirname, PROJECT_FOLDER);
const DESTINATION_FILE = 'bundle.css';
const STYLES_FOLDER = 'styles';
const ABSOLUTE_STYLES_FOLDER = path.join(__dirname, STYLES_FOLDER);

const READDIR_OPTIONS = {
  withFileTypes: true,
};

// function haveNewContent(styleFiles, outputPath, destinationFile) {
//   fs.stat(path.join(outputPath, destinationFile), (error, destinationStat) => {
//     if (error) return console.error(error.message);
//     const changeTimeOfDestinationFile = destinationStat.ctimeMs;
//     styleFiles.forEach((file) => {
//       fs.stat(path.join(file.path, file.name), (error, sourceStat) => {
//         if (error) return console.error(error.message);
//         if (sourceStat.ctimeMs > changeTimeOfDestinationFile) return true;
//       });
//     });
//   });
//   return false;
// }

// function haveRemovedFiles() {}

// function satisfyMergeConditions(
//   styleFiles,
//   outputPath,
//   destinationFile,
//   readdirOptions,
// ) {
//   // check if destination file exists
//   fs.access(path.join(outputPath, destinationFile), (error) => {
//     if (error) return false;
//     return haveNewContent(styleFiles, outputPath, destinationFile);
//   });
// }

function mergeStyleFiles(styleFiles, outputPath, destinationFile) {
  fs.unlink(path.join(outputPath, destinationFile), () => {
    const outputStreamOptions = { flags: 'a' };
    styleFiles.forEach((file) => {
      const input = fs.createReadStream(path.join(file.path, file.name));
      const output = fs.createWriteStream(
        path.join(outputPath, destinationFile),
        outputStreamOptions,
      );
      output.write(`/* Initial file: ${file.name}*/`);
      input.pipe(output);
    });
  });
}

function processStyles(
  sourcePath,
  outputPath,
  destinationFile,
  readdirOptions,
) {
  fs.readdir(sourcePath, readdirOptions, (error, dirContent) => {
    if (error) return console.error(error.message);
    const styleFiles = dirContent.filter(
      (file) => file.isFile() && path.extname(file.name) === '.css',
    );
    // if (
    //   satisfyMergeConditions(
    //     styleFiles,
    //     outputPath,
    //     destinationFile,
    //     readdirOptions,
    //   )
    // ) {
    mergeStyleFiles(styleFiles, outputPath, destinationFile);
    // }
  });
}

processStyles(
  ABSOLUTE_STYLES_FOLDER,
  ABSOLUTE_PROJECT_FOLDER,
  DESTINATION_FILE,
  READDIR_OPTIONS,
);
