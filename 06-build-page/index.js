const fs = require('fs');
const path = require('path');

const copyDirectory = require('../04-copy-directory/index');
const processStyle = require('../05-merge-styles/index');

const DESTINATION_FOLDER_NAME = 'project-dist';
const STYLES_FOLDER_NAME = 'styles';
const ASSETS_FOLDER_NAME = 'assets';
const COMPONENTS_FOLDER_NAME = 'components';
const TEMPLATE_HTML_FILE = 'template.html';
const DESTINATION_HTML_FILE = 'index.html';
const DESTINATION_CSS_FILE = 'style.css';

function saveHTML(htmlTemplate, fileContentList) {
  const absoluteDestinationPath = path.join(
    __dirname,
    DESTINATION_FOLDER_NAME,
    DESTINATION_HTML_FILE,
  );
  for (let content of fileContentList) {
    htmlTemplate = htmlTemplate.replace(
      content.templateTag,
      content.fileContent,
    );
  }
  const output = fs.createWriteStream(absoluteDestinationPath);
  output.write(htmlTemplate);
}

function getComponents(htmlTemplate, files) {
  const fileContentList = [];
  let fileCounter = 0;
  for (const file of files) {
    const fileAbsolutePath = path.join(file.path, file.name);
    const input = fs.createReadStream(fileAbsolutePath, 'utf-8');
    let fileContent = '';
    input.on('data', (chunk) => (fileContent += chunk));
    input.on('end', () => {
      const templateName = path.basename(file.name, '.html');
      const templateTag = `{{${templateName}}}`;
      fileContentList.push({ templateTag, fileContent });
      fileCounter += 1;
      if (fileContentList.length === fileCounter)
        saveHTML(htmlTemplate, fileContentList);
    });
    input.on('error', (error) => console.error(error.message));
  }
}

function fillHTML(htmlTemplate) {
  const componentsAbsolutePath = path.join(__dirname, COMPONENTS_FOLDER_NAME);
  const readdirOptions = {
    withFileTypes: true,
  };
  fs.readdir(
    componentsAbsolutePath,
    readdirOptions,
    async (error, dirContent) => {
      if (error) return console.error(error.message);
      const files = dirContent.filter((file) => {
        return file.isFile() && path.extname(file.name) === '.html';
      });
      try {
        getComponents(htmlTemplate, files);
      } catch (error) {
        console.error(error.message);
      }
    },
  );
}

function createHTML() {
  const templateAbsolutePath = path.join(__dirname, TEMPLATE_HTML_FILE);
  const input = fs.createReadStream(templateAbsolutePath, 'utf-8');
  let htmlTemplate = '';
  input.on('data', (chunk) => (htmlTemplate += chunk));
  input.on('end', () => {
    fillHTML(htmlTemplate);
  });
  input.on('error', (error) => console.error(error.message));
}

function mergeStyles() {
  const absoluteSourceFolder = path.join(__dirname, STYLES_FOLDER_NAME);
  const absoluteDestinationFolder = path.join(
    __dirname,
    DESTINATION_FOLDER_NAME,
  );
  const destinationFile = DESTINATION_CSS_FILE;
  const readdirOptions = {
    withFileTypes: true,
  };
  processStyle.processStyles(
    absoluteSourceFolder,
    absoluteDestinationFolder,
    destinationFile,
    readdirOptions,
  );
}

function copyAssets() {
  const absoluteSourcePath = path.join(__dirname, ASSETS_FOLDER_NAME);
  const absoluteDestinationPath = path.join(
    __dirname,
    DESTINATION_FOLDER_NAME,
    ASSETS_FOLDER_NAME,
  );
  const readdir_options = {
    withFileTypes: true,
  };

  copyDirectory.copyDirectory(
    absoluteSourcePath,
    absoluteDestinationPath,
    readdir_options,
  );
}

function createDestinationFolder() {
  const destinationAbsolutePath = path.join(__dirname, DESTINATION_FOLDER_NAME);
  const mkdirOptions = {
    recursive: true,
  };
  fs.mkdir(destinationAbsolutePath, mkdirOptions, (error) => {
    if (error) return console.error(error.message);
    createHTML();
    mergeStyles();
    copyAssets();
  });
}

function buildPage() {
  createDestinationFolder();
}

buildPage();
