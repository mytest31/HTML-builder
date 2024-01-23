const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const PROJECT_FOLDER = 'project-dist';
const ABSOLUTE_PROJECT_FOLDER = path.join(__dirname, PROJECT_FOLDER);
const DESTINATION_FILE = 'bundle.css';
const STYLES_FOLDER = 'styles';
const ABSOLUTE_STYLES_FOLDER = path.join(__dirname, STYLES_FOLDER);

const READDIR_OPTIONS = {
  withFileTypes: true,
};

async function checkModifiedFiles(
  styleFiles,
  outputPath,
  destinationFile,
  changeTimeOfDestinationFile,
) {
  let maxModificationDate = Number.NEGATIVE_INFINITY;
  for (const file of styleFiles) {
    try {
      const fileStat = await fsPromises.stat(path.join(file.path, file.name));
      if (fileStat.ctimeMs > maxModificationDate) {
        maxModificationDate = fileStat.ctimeMs;
      }
    } catch (error) {
      console.error(error.message);
    }
  }
  if (changeTimeOfDestinationFile < maxModificationDate) {
    mergeStyleFiles(styleFiles, outputPath, destinationFile);
  }
}

function contentHandler(styleFiles, sourcePath, outputPath, destinationFile) {
  // check if the folder was modified
  fs.stat(path.join(outputPath, destinationFile), (error, destinationStat) => {
    if (error) return console.error(error.message);
    const changeTimeOfDestinationFile = destinationStat.ctimeMs;
    fs.stat(sourcePath, (error, sourcePathStat) => {
      if (error) console.error(error.message);
      const changeTimeOfSourcePath = sourcePathStat.ctimeMs;
      if (changeTimeOfDestinationFile < changeTimeOfSourcePath) {
        // check if files were added or removed
        mergeStyleFiles(styleFiles, outputPath, destinationFile);
      } else {
        // check if files were modified
        checkModifiedFiles(
          styleFiles,
          outputPath,
          destinationFile,
          changeTimeOfDestinationFile,
        );
      }
    });
  });
}

function mergeStyleFiles(styleFiles, outputPath, destinationFile) {
  fs.unlink(path.join(outputPath, destinationFile), () => {
    const outputStreamOptions = { flags: 'a' };
    styleFiles.forEach((file) => {
      const input = fs.createReadStream(path.join(file.path, file.name));
      const output = fs.createWriteStream(
        path.join(outputPath, destinationFile),
        outputStreamOptions,
      );
      output.write(`/* ${file.name} */\n`);
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
    // check if destination file exists
    fs.access(path.join(outputPath, destinationFile), (error) => {
      if (error) {
        mergeStyleFiles(styleFiles, outputPath, destinationFile);
      } else {
        contentHandler(styleFiles, sourcePath, outputPath, destinationFile);
      }
    });
  });
}

processStyles(
  ABSOLUTE_STYLES_FOLDER,
  ABSOLUTE_PROJECT_FOLDER,
  DESTINATION_FILE,
  READDIR_OPTIONS,
);

module.exports = { processStyles };