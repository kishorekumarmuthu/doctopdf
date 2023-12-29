const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");

/* <style>.title-section{    margin-left: auto;    margin-right: auto;    width: 50%;    display: block;    text-align: center;}.columns{ column-count: 2; column-gap: 0; margin-left: 0; margin-right: 0;}table, th, tr, td {border: 0.5px groove;text-align: center;width: 40%;}h2, p, table, img {display: block;margin-left: auto;margin-right: auto;width: 90%; font-size: 0.9em;}h2{ font-size: 1.2em;}img{width: 70%; margin-bottom:10px;}</style> */

//let data = "<style>.title-section{margin-left: auto;margin-right: auto;width: 100%; display: block; text-align: center;}.columns{ column-count: 2; column-gap: 0; margin-left: 0; margin-right: 0;}table, th, tr, td {border: 0.5px groove;text-align: center;width: 40%;}h2, p, table, img {display: block;margin-left: auto;margin-right: auto;width: 90%; font-size: 1em;}h2{ font-size: 1.4em;}img{width: 80%; margin-bottom:10px;}</style>"
//let data = "<style>.title-section {font-family: 'Times New Roman', Times, serif;margin-left: auto;margin-right: auto;width: 100%;display: block;text-align: center;font-size: 18px;}.title-section p {font-size: 18px;}.columns {font-family: 'Times New Roman', Times, serif;column-count: 2;column-gap: 1;margin-left: 5px;margin-right: 5px;text-align: justify;margin-top: 20px;}.columns h2 {font-family: 'Times New Roman', Times, serif;font-size: 16px;margin-left: 5px;}.columns p {font-family: 'Times New Roman', Times, serif;font-size: 16px;line-height: 16px;display: block;}table, th, tr, td {font-family: 'Times New Roman', Times, serif;font-size: 12px;width: 75%;}table {margin-bottom: 20px;border: 0.1px groove;column-count: 1;}img {width: 80%;margin-bottom: 10px;margin-top: 14px;}ol li, ul li, li {font-family: 'Times New Roman', Times, serif;font-size: 16px;line-height: 16px;}.title-section .title-author {font-size: 14px;line-height: 5px;font-weight: bold;font-style: italic;}</style>"
let styleData =
  "<style>.title-section{font-family:'Times New Roman',Times,serif;margin-left:auto;margin-right:auto;width:100%;display:block;text-align:center;font-size:18px}.title-section p{font-size:18px}.columns{font-family:'Times New Roman',Times,serif;column-count:2;column-gap:1;margin-left:5px;margin-right:5px;text-align:justify; word-spacing: normal; margin-top:20px; word-break: keep-all; word-wrap: break-word;}.columns h2{font-family:'Times New Roman',Times,serif;font-size:16px;margin-left:5px}.columns p{word-spacing: 2px; word-wrap: break-word; white-space: normal;  font-family:'Times New Roman',Times,serif;font-size:16px;line-height:16px;display:block}th,tr,td{font-family:'Times New Roman',Times,serif;font-size:12px}table{margin-bottom:20px;margin-top:10px;column-count:1;width:100%;border-collapse:collapse;text-align:center;page-break-inside: avoid !important;}th{font-weight:bold}td{border:1px groove;text-align:center}img{width:80%;margin-bottom:10px;margin-top:14px; page-break-inside: avoid !important;}ol li,ul li,li{font-family:'Times New Roman',Times,serif;font-size:16px;line-height:16px}table tbody tr td,table tbody tr td ol li,table tbody tr td ul{font-size:12px}table tbody tr td ol li b,table tbody tr td ul b{font-size:12px;font-weight:400}.title-section .title-author{font-size:14px;line-height:5px;font-weight:bold;margin-left:5px;text-align:left}table tr:first-child td{text-align:center;background-color:#d3d3d3;font-weight:bold}tr:not(:first-child) td{text-align:left}tr:not(:first-child) td p{margin-left:4px} .refcontent p {word-spacing: normal; line-height: 16px;margin: 0;padding: 0; word-wrap: break-word;}.refcontent a {color: currentColor;cursor: not-allowed;text-decoration: none;pointer-events: none;} .refcontent p b {font-weight: normal;}</style><script> const tag = document.getElementsByTagName('a');for (var i = 0; i < tag.length; i++) {tag[i].removeAttribute('href');}</script >";
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
    convertImage: mammoth.images.imgElement(async function (image) {
      const imageBuffer = await image.read("base64");
      //const imageBuffer = await image.readAsBase64String()
      //console.log(image.contentType)
      return {
        src: "data:" + image.contentType + ";base64," + imageBuffer,
      };
      // return image.readAsBase64String().then(function (imageBuffer) {
      //   return {
      //     src: "data:" + image.contentType + ";base64," + imageBuffer,
      //   };
      // });
    }),
    //transformDocument: mammoth.transforms.paragraph(transformParagraph),
  };
  const buf = fs.readFileSync(".\\" + `${file}`);
  mammoth
    //.convertToHtml({ path: ".\\" + `${file}` }, options)
    .convertToHtml({ buffer: buf }, options)
    .then(async function (result) {
      var html = result.value; // The generated HTML
      let resultWrite = fs.writeFileSync(".\\" + `${file.split(".")[0]}` + ".htm", result.value);
      let messages = result.messages; // Any messages, such as warnings during conversion
      // console.log(messages);
      // console.log(resultWrite)
      fs.open(
        ".\\" + `${file.split(".")[0]}` + ".htm",
        "a",
        function (err, fd) {
          if (err) {
            console.log(err.message);
          } else {
            fs.write(fd, styleData, function (err, bytes) {
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

//htmltopdf()

//setTimeout(htmltopdf, 3000)

// const batchfilepath = './batch-sample/batch3/'
// await finddocxfiles.FindDocxFiles(batchfilepath)
// console.log(finddocxfiles.docxFiles)

// if(finddocxfiles.docxFiles.length!=0){
//     for(const file of finddocxfiles.docxFiles){
//         await mammothtohtml(file)
//     }
// }

// let docxFiles = []

// function FindDocxFiles(Directory) {
//     fs.readdirSync(Directory).forEach(File => {
//         const Absolute = path.join(Directory, File);
//         if (fs.statSync(Absolute).isDirectory()) return FindDocxFiles(Absolute);
//         else if(path.extname(File) == ".doc" || path.extname(File) == ".htm" || path.extname(File) == ".rtf" || path.extname(File) == ".pdf")
//         {
//             return fs.unlinkSync(Absolute)
//         }
//         else{
//             console.log(Absolute)
//             return docxFiles.push(Absolute);
//         }
//     });
// }

// FindDocxFiles("./batch-sample/batch3");
// console.log(docxFiles)

//let imageCounter = 1;
//const  mammothtohtml = require("./mammothdoctohtml.js")
//let findIndexImage = []
//let individualImageIndex
//const imageStringArr = []
//let imageStr
//const dir = './images';
//let imageFiles = fs.readdirSync(dir);

// imageFiles.forEach((file,index) => {
//     imageStr = "data:image/png;base64,"+fs.readFileSync(`${dir}/${file}`, 'base64')
//     imageStringArr.push(imageStr)
//     //console.log(imageStringArr[index])
//     //console.log(`${dir}/image${i}`);
// })

// convertImage: mammoth.images.imgElement(async function(element) {
//     return await element.read('base64').then(function(imageBuffer) {
//         const imgType = element.contentType.split('/')[1];
//         const imgName = `image${imageCounter}.${imgType}`;
//         //const absolutePath = path.resolve('.\\batch-sample\\62\\submission\\review\\62-105-1-RV.docx');
//         const absolutePath = path.resolve('.\\'+`${file}`);
//         const directoryName = path.dirname(absolutePath)
//         console.log(directoryName)
//         const imgPath = path.join(directoryName+"\\"+imgName)
//         //const imgPath = path.join(path.dirname(".\\batch-sample\\62\\submission\\review\\62-105-1-RV.docx"), imgName);
//         fs.writeFile(imgPath, imageBuffer, 'base64', err => {
//             if (err) {
//                 console.log(err);
//             } else {
//                 console.log(`${imgPath} was saved.`);
//             }
//         });
//         imageCounter++;
//         return {
//            src: imgPath
//         };
//     })
// }),

// convertImage: mammoth.images.imgElement(function(image) {
//     return image.read("base64").then(function(imageBuffer) {
//         return {
//             src: "data:" + image.contentType + ";base64," + imageBuffer
//         };
//     });
// }),

// const officeParser = require('officeparser');

// officeParser.parseOffice("./Ejournal/1/articles/62/submission/original/62-104-3-SM.docx", function(data, err){
//     // "data" string in the callback here is the text parsed from the office file passed in the first argument above
//     if (err) return console.log(err);
//     console.log(data)
// })

//let content = '</p><p>Clinical examination revealed anterior bowing of the right tibia and bilateral sensorineural hearing loss. Examination was otherwise unrevealing. </p><p> <img src="image1.png" />'

// let findIndexImage2 = []

// imagePatternString2 = mainStr.match(/<img src=(.*?)\/>/gim)
// console.log(imagePatternString2)
// imagePatternString2.forEach((data, index) =>{
//     individualImageIndex = mainStr.indexOf(data)
//     console.log(individualImageIndex)
//     findIndexImage2.push(individualImageIndex)
//     mainStr = mainStr.replace(imagePatternString2[index], imageStringArr[index])
//     //mainStr = insert(mainStr, imageStringArr[index], findIndexImage2[index])
// })
