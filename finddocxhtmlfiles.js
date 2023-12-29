const fs = require("fs");
const path = require("path");

let htmFiles = [];
let docxFiles = [];

async function FindHtmFiles(Directory) {
  fs.readdirSync(Directory).forEach((File) => {
    const Absolute = path.join(Directory, File);
    if (fs.statSync(Absolute).isDirectory()) return FindHtmFiles(Absolute);
    if (Absolute.includes("inter")) {
      //return fs.unlinkSync(Absolute);
    }
    if (
      path.extname(File) == ".pdf" ||
      path.extname(File) == ".jpeg" ||
      path.extname(File) == ".png" ||
      path.extname(File) == ".tiff" ||
      path.extname(File) == ".x-emf" ||
      path.extname(File) == ".jpg" ||
      path.extname(File) == ".xlsx"
    ) {
      //return fs.unlinkSync(Absolute);
    }
    if (path.extname(File) == ".htm") {
      if (
        Absolute.includes("review") &&
        !Absolute.includes("inter") &&
        !Absolute.includes("imageconvert")
      ) {
        return htmFiles.push(Absolute);
      }
    }
  });
}

async function FindDocxFiles(Directory) {
  fs.readdirSync(Directory).forEach((File) => {
    const Absolute = path.join(Directory, File);
    if (fs.statSync(Absolute).isDirectory()) return FindDocxFiles(Absolute);
    else if (
      path.extname(File) == ".doc" ||
      path.extname(File) == ".htm" ||
      path.extname(File) == ".rtf" ||
      path.extname(File) == ".pdf" ||
      path.extname(File) == ".png" ||
      Absolute.includes("original") ||
      path.extname(File) == ".jpeg" ||
      path.extname(File) == ".tiff" ||
      path.extname(File) == ".x-emf" ||
      path.extname(File) == ".jpg" ||
      path.extname(File) == ".xlsx" ||
      path.extname(File) == ".tif" ||
      Absolute.includes("supp")
    ) {
      //return fs.unlinkSync(Absolute);
    }
    if (path.extname(File) == ".docx") {
      console.log(Absolute);
      return docxFiles.push(Absolute);
    }
  });
}

module.exports = { htmFiles, docxFiles, FindDocxFiles, FindHtmFiles };

// FindHtmFiles("./batch-sample");

// console.log(htmFiles)
