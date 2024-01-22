const fs = require('fs');
const path = require('path');

const SOURCE_FOLDER = 'files';
const ABSOLUTE_SOURCE_PATH = path.join(__dirname, SOURCE_FOLDER);
const DESTINATION_FOLDER = 'files-copy';
const ABSOLUTE_DESTINATION_PATH = path.join(__dirname, DESTINATION_FOLDER);

const MKDIR_OPTIONS = {
  recursive: true,
};

const READDIR_OPTIONS = {
  withFileTypes: true,
};

function copyAllFiles(
  absoluteSourcePath,
  absoluteDestinationPath,
  readdir_option,
) {
  fs.readdir(absoluteSourcePath, readdir_option, (error, dirContent) => {
    if (error) return console.error(error.message);
    const files = dirContent.filter((file) => file.isFile());
    files.forEach((file) => {
      fs.stat(
        path.join(absoluteDestinationPath, file.name),
        (error, statsDestination) => {
          if (error) {
            // there is no file in the destination folder
            fs.copyFile(
              path.join(absoluteSourcePath, file.name),
              path.join(absoluteDestinationPath, file.name),
              (err) => {
                if (err) return console.error(err.message);
                console.log(
                  `The file ${file.name}` +
                    ' was copied from source to destination folder',
                );
              },
            );
          } else {
            // copy modified files
            fs.stat(path.join(file.path, file.name), (error, statsSource) => {
              if (error) return console.error(error.message);
              const sourceModificationTime = statsSource.atimeMs;
              const destinationModificationTime = statsDestination.atimeMs;
              if (sourceModificationTime > destinationModificationTime) {
                fs.copyFile(
                  path.join(absoluteSourcePath, file.name),
                  path.join(absoluteDestinationPath, file.name),
                  (err) => {
                    if (err) return console.error(err.message);
                    console.log(
                      `The file ${file.name}` +
                        ' was updated in the destination folder',
                    );
                  },
                );
              }
            });
          }
        },
      );
    });
  });
  fs.readdir(absoluteDestinationPath, readdir_option, (error, dirContent) => {
    if (error) return console.error(error.message);
    const files = dirContent.filter((file) => file.isFile());
    files.forEach((file) => {
      fs.stat(path.join(absoluteSourcePath, file.name), (error) => {
        if (error) {
          // there is no file in the source folder
          fs.rm(path.join(absoluteDestinationPath, file.name), (err) => {
            if (err) return console.error(err.message);
            console.log(
              `The file ${file.name}` +
                ' was removed from the destination folder',
            );
          });
        }
      });
    });
  });
}

function copyDirectory(
  absoluteSourcePath,
  absoluteDestinationPath,
  readdir_option,
) {
  fs.mkdir(ABSOLUTE_DESTINATION_PATH, MKDIR_OPTIONS, (error) => {
    if (error) return console.error(error.message);
    copyAllFiles(absoluteSourcePath, absoluteDestinationPath, readdir_option);
  });
}

copyDirectory(ABSOLUTE_SOURCE_PATH, ABSOLUTE_DESTINATION_PATH, READDIR_OPTIONS);
