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

/**
 * copy the file from source to destination folder
 * @param {*} absoluteSourcePath - the absolute path to source folder
 * @param {*} absoluteDestinationPath - the absolute path to destination folder
 * @param {*} file - the file object of fs.Dirent class
 */
function copyOneFile(absoluteSourcePath, absoluteDestinationPath, file) {
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
}

/**
 * update the modified file from source to destination folder
 * @param {*} absoluteSourcePath - the absolute path to source folder
 * @param {*} absoluteDestinationPath - the absolute path to destination folder
 * @param {*} file - the file object of fs.Dirent class
 * @param {*} statsDestination - stats info about file in the destination folder
 */
function updateOneFile(
  absoluteSourcePath,
  absoluteDestinationPath,
  file,
  statsDestination,
) {
  fs.stat(path.join(file.path, file.name), (error, statsSource) => {
    if (error) return console.error(error.message);
    const sourceModificationTime = statsSource.mtimeMs;
    const destinationModificationTime = statsDestination.mtimeMs;
    if (sourceModificationTime > destinationModificationTime) {
      fs.copyFile(
        path.join(absoluteSourcePath, file.name),
        path.join(absoluteDestinationPath, file.name),
        (err) => {
          if (err) return console.error(err.message);
          console.log(
            `The file ${file.name}` + ' was updated in the destination folder',
          );
        },
      );
    }
  });
}

/**
 * copy and update files from source to destination folder
 * @param {*} absoluteSourcePath - the absolute path to source folder
 * @param {*} absoluteDestinationPath - the absolute path to destination folder
 * @param {*} readdir_options - option of readdir
 */
function copyAndUpdateFiles(
  absoluteSourcePath,
  absoluteDestinationPath,
  readdir_options,
) {
  fs.readdir(absoluteSourcePath, readdir_options, (error, dirContent) => {
    if (error) return console.error(error.message);
    const files = dirContent.filter((file) => file.isFile());
    files.forEach((file) => {
      fs.stat(
        path.join(absoluteDestinationPath, file.name),
        (error, statsDestination) => {
          if (error) {
            // there is no file in the destination folder
            copyOneFile(absoluteSourcePath, absoluteDestinationPath, file);
          } else {
            updateOneFile(
              absoluteSourcePath,
              absoluteDestinationPath,
              file,
              statsDestination,
            );
          }
        },
      );
    });
  });
}

/**
 * remove files that were deleted in the source folder
 * @param {*} absoluteSourcePath - the absolute path to source folder
 * @param {*} absoluteDestinationPath - the absolute path to destination folder
 * @param {*} readdir_option
 */
function removeInvalidFiles(
  absoluteSourcePath,
  absoluteDestinationPath,
  readdir_option,
) {
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

function processAllFiles(
  absoluteSourcePath,
  absoluteDestinationPath,
  readdir_options,
) {
  removeInvalidFiles(
    absoluteSourcePath,
    absoluteDestinationPath,
    readdir_options,
  );
  copyAndUpdateFiles(
    absoluteSourcePath,
    absoluteDestinationPath,
    readdir_options,
  );
}

function copyDirectoryFiles(
  absoluteSourcePath,
  absoluteDestinationPath,
  readdir_options,
) {
  fs.mkdir(ABSOLUTE_DESTINATION_PATH, MKDIR_OPTIONS, (error) => {
    if (error) return console.error(error.message);
    processAllFiles(
      absoluteSourcePath,
      absoluteDestinationPath,
      readdir_options,
    );
  });
}

copyDirectoryFiles(
  ABSOLUTE_SOURCE_PATH,
  ABSOLUTE_DESTINATION_PATH,
  READDIR_OPTIONS,
);
