const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");
let imageCounter = 0;

let docxFiles = [];

function FindDocxFiles(Directory) {
  fs.readdirSync(Directory).forEach((File) => {
    const Absolute = path.join(Directory, File);
    if (fs.statSync(Absolute).isDirectory()) return FindDocxFiles(Absolute);
    // else if(path.extname(File) == ".doc"
    // || path.extname(File) == ".htm"
    // || path.extname(File) == ".rtf"
    // || path.extname(File) == ".png"
    // || path.extname(File) == ".jpg"
    // || path.extname(File) == ".jpeg"
    // || path.extname(File) == ".pdf"
    // )
    // {
    //     //console.log(Absolute)
    //     //return ThroughDirectory(Absolute)
    // }
    else if (Absolute.includes("review") && path.extname(File) == ".docx") {
      console.log(Absolute);
      return docxFiles.push(Absolute);
    }
  });
}

FindDocxFiles("./batch_sample/articles/Vol-8-Issue-2-2021-Oct-26-2022/");
console.log(docxFiles);

if (docxFiles.length != 0) {
  for (const file of docxFiles) {
    mammothtohtml(file);
  }
}

/* <style>.title-section{    margin-left: auto;    margin-right: auto;    width: 50%;    display: block;    text-align: center;}.columns{ column-count: 2; column-gap: 0; margin-left: 0; margin-right: 0;}table, th, tr, td {border: 0.5px groove;text-align: center;width: 40%;}h2, p, table, img {display: block;margin-left: auto;margin-right: auto;width: 90%; font-size: 0.9em;}h2{ font-size: 1.2em;}img{width: 70%; margin-bottom:10px;}</style> */

//let data = "<style>.title-section{margin-left: auto;margin-right: auto;width: 100%; display: block; text-align: center;}.columns{ column-count: 2; column-gap: 0; margin-left: 0; margin-right: 0;}table, th, tr, td {border: 0.5px groove;text-align: center;width: 40%;}h2, p, table, img {display: block;margin-left: auto;margin-right: auto;width: 90%; font-size: 1em;}h2{ font-size: 1.4em;}img{width: 80%; margin-bottom:10px;}</style>"
//let data = "<style>.title-section {font-family: 'Times New Roman', Times, serif;margin-left: auto;margin-right: auto;width: 100%;display: block;text-align: center;font-size: 18px;}.title-section p {font-size: 18px;}.columns {font-family: 'Times New Roman', Times, serif;column-count: 2;column-gap: 1;margin-left: 5px;margin-right: 5px;text-align: justify;margin-top: 20px;}.columns h2 {font-family: 'Times New Roman', Times, serif;font-size: 16px;margin-left: 5px;}.columns p {font-family: 'Times New Roman', Times, serif;font-size: 16px;line-height: 16px;display: block;}table, th, tr, td {font-family: 'Times New Roman', Times, serif;font-size: 12px;width: 75%;}table {margin-bottom: 20px;border: 0.1px groove;column-count: 1;}img {width: 80%;margin-bottom: 10px;margin-top: 14px;}ol li, ul li, li {font-family: 'Times New Roman', Times, serif;font-size: 16px;line-height: 16px;}.title-section .title-author {font-size: 14px;line-height: 5px;font-weight: bold;font-style: italic;}</style>"
let data =
  "<style> .title-section {font-family: 'Times New Roman', Times, serif;margin-left: auto;margin-right: auto;width: 100%;display: block;text-align: center;font-size: 18px;}.title-section p {font-size: 18px;}.columns {font-family: 'Times New Roman', Times, serif;column-count: 2;column-gap: 1;margin-left: 5px;margin-right: 5px;text-align: justify;margin-top: 20px;}.columns h2 {font-family: 'Times New Roman', Times, serif;font-size: 16px;margin-left: 5px;}.columns p {font-family: 'Times New Roman', Times, serif;font-size: 16px;line-height: 16px;display: block;}th, tr, td {font-family: 'Times New Roman', Times, serif;font-size: 12px;}table {margin-bottom: 20px;column-count: 1;width: 100%;border-collapse: collapse;}td{border: 1px groove;}img {width: 80%;margin-bottom: 10px;margin-top: 14px;}ol li, ul li, li {font-family: 'Times New Roman', Times, serif;font-size: 16px;line-height: 16px;}.title-section .title-author {font-size: 14px;line-height: 5px;font-weight: bold;font-style: italic;}</style>";
async function mammothtohtml(file) {
  //await mammoth.convertToHtml({path: ".\\batch-sample\\62\\submission\\review\\62-105-1-RV.docx"}, options)
  function transformParagraph(element) {
    if (element.alignment === "center" && !element.styleId) {
      return { ...element, styleId: "Heading2" };
    } else {
      return element;
    }
  }
  var options = {
    convertImage: mammoth.images.imgElement(async function (element) {
      //console.log(`${file.split('review\\')[0]}`+"images")
      let imgDir = `${file.split("review\\")[0]}` + "review/" + "images";
      if (!fs.existsSync(imgDir)) {
        fs.mkdirSync(imgDir, { recursive: true });
      }
      const imageBuffer = await element.read("base64");
      const imgType = element.contentType.split("/")[1];
      const imgName = `image${imageCounter + 1}.${imgType}`;
      const imgPath = path.join(imgDir, imgName);
      console.log(imgPath);
      fs.writeFile(imgPath, imageBuffer, "base64", (err) => {
        if (err) {
          console.log(err);
        } else {
          imageCounter++;
          console.log(`${imgPath} was saved.`);
        }
      });
      return {
        src: imgPath,
      };
    }),
    transformDocument: mammoth.transforms.paragraph(transformParagraph),
  };
  mammoth
    .convertToHtml({ path: ".\\" + `${file}` }, options)
    .then(function (result) {
      var html = result.value; // The generated HTML
      fs.writeFileSync(
        ".\\" + `${file.split(".")[0]}imageconvert` + ".htm",
        result.value
      );
      var messages = result.messages; // Any messages, such as warnings during conversion
      fs.open(
        ".\\" + `${file.split(".")[0]}` + ".htm",
        "a",
        function (err, fd) {
          if (err) {
            console.log(err.message);
          } else {
            fs.write(fd, data, function (err, bytes) {
              if (err) {
                console.log(err.message);
              } else {
                console.log(bytes + "bytes written");
              }
            });
          }
        }
      );
    })
    .done();
}

module.exports = { mammothtohtml };
