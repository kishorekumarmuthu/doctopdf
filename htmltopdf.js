const fs = require("fs");
const path = require("path");
const headerImage = require("./headerimage.js");
const html_to_pdf = require("html-pdf-node");
const pdf_parse = require("pdf-parse");
const sessionstorage = require("sessionstorage");
const runpdflib = require("./pdflib");
const { type } = require("os");

async function htmlprocessing(file, title, author_name, author_aff) {
  console.log(title, author_name, author_aff)
  let str = fs.readFileSync(file).toString();

  str = str.replace(/<h2>Top of Form<\/h2><h2>Bottom of Form<\/h2>/gim, "");
  str = str.replace(/<h2>Bottom of Form<\/h2>/gim, "");
  str = str.replace(/<h2>Top of Form<\/h2>/gim, "");
  str = str.replace(/  +/gim, " ");
  str = str.replace(/<p><img/gim, "<p> <img");
  str = str.replace(/\/><img/gim, "/> <img");
  str = str.replace(/\/><\/p>/gim, "/>");
  //str = str.replaceAll(/<table>/gim, "</div><table>");
  //str = str.replaceAll(/<\/table>/gim, '</table><div class="columns">');
  str = str.replaceAll(/<h2>/gim, "<p><b>");
  str = str.replaceAll(/<\/h2>/gim, "</p></b>");
  str = str.replaceAll(/<h1>/gim, "<p><b>");
  str = str.replaceAll(/<\/h1>/gim, "</p></b>");
  str = str.replaceAll(/<h3>/gim, "<p><b>");
  str = str.replaceAll(/<\/h3>/gim, "</p></b>");
  str = str.replaceAll(/<h4>/gim, "<p><b>");
  str = str.replaceAll(/<\/h4>/gim, "</p></b>");
  str = str.replaceAll(
    /Key(.*?)words/gim || /Key(.*?)word/gim,
    "<b>Keyword(s)</b>"
  );
  str = str.replaceAll(/ :/gim, ":");
  str = str.replaceAll(/Figure./gim || /Figure/gim, "Fig ");
  str = str.replaceAll(/–/gim, "-");
  str = str.replaceAll(/<u>/gim, "");
  str = str.replaceAll(/<\/u>/gim, "");
  str = str.replaceAll(/<a href="(https?:\/\/[^\s]+)">/gim, "");
  str = str.replaceAll(/<a href="(http?:\/\/[^\s]+)">/gim, "");
  //str = str.replaceAll(/<a.*?<\/a>/gim, "");
  str = str.replace(/<a\b[^>]*>/gim, "").replace(/<\/a>/gim, "");
  str = str.replaceAll(/<\/a>/gim, "");

  //SUBHEADINGS REPLACEMENT

  str = str.replaceAll(/<p>(Conclusion|CONCLUSION|<em>CONCLUSION<\/em>|<em>CONCLUSION<\/em>)<\/p>/gim, "<p><b>Conclusion</b></p>");
  str = str.replaceAll(/<p>(Conclusion(.*?):(.*?)|CONCLUSION(.*?):(.*?)|<em>CONCLUSION(.*?):(.*?)<\/em>|<em>Conclusion(.*?):(.*?)<\/em>)<\/p>/gim, "<p><b>Conclusion</b></p>");
  str = str.replaceAll(/<p>(Discussion|DISCUSSION|<em>Discussion<\/em>|<em>DISCUSSION<\/em>)<\/p>/gim, "<p><b>Discussion:</b></p>");
  str = str.replaceAll(/<p>(Discussion:|DISCUSSION:|<em>Discussion:<\/em>|<em>DISCUSSION:<\/em>)<\/p>/gim, "<p><b>Discussion:</b></p>");
  str = str.replaceAll(/<p>(Case Report|CASE REPORT|<em>Case Report<\/em>|<em>CASE REPORT<\/em>)<\/p>/gim, "<p><b>Case Report:</b></p>");
  str = str.replaceAll(/<p>(Case Report:|CASE REPORT:|<em>Case Report:<\/em>|<em>CASE REPORT:<\/em>)<\/p>/gim, "<p><b>Case Report:</b></p>");
  str = str.replaceAll(/<p>(Case History|CASE HISTORY|<em>Case History<\/em>|<em>CASE HISTORY<\/em>)<\/p>/gim, "<p><b>Case Report:</b></p>");
  str = str.replaceAll(/<p>(Case History:|CASE HISTORY:|<em>Case History:<\/em>|<em>CASE HISTORY:<\/em>)<\/p>/gim, "<p><b>Case Report:</b></p>");
  str = str.replaceAll(/<p>(Treatment|TREATMENT|<em>TREATMENT<\/em>|<em>Treatment<\/em>)<\/p>/gim, "<p><b>Treatment:</b></p>");
  str = str.replaceAll(/<p>(Treatment:|TREATMENT:|<em>TREATMENT:<\/em>|<em>Treatment:<\/em>)<\/p>/gim, "<p><b>Treatment:</b></p>");
  str = str.replaceAll(/<p>(Treatment options|TREATMENT OPTIONS|<em>TREATMENT OPTIONS<\/em>|<em>Treatment options<\/em>)<\/p>/gim, "<p><b>Treatment options:</b></p>");
  str = str.replaceAll(/<p>(Treatment options:|TREATMENT OPTIONS:|<em>TREATMENT OPTIONS:<\/em>|<em>Treatment options:<\/em>)<\/p>/gim, "<p><b>Treatment options:</b></p>");
  str = str.replaceAll(/<p>(Diagnosis|DIAGNOSIS|<em>DIAGNOSIS<\/em>|<em>Diagnosis<\/em>)<\/p>/gim, "<p><b>Diagnosis:</b></p>");
  str = str.replaceAll(/<p>(Diagnosis:|DIAGNOSIS:|<em>DIAGNOSIS:<\/em>|<em>Diagnosis:<\/em>)<\/p>/gim, "<p><b>Diagnosis:</b></p>");
  str = str.replaceAll(/<p>(Final Diagnosis|FINAL DIAGNOSIS|<em>FINAL DIAGNOSIS<\/em>|<em>Final Diagnosis<\/em>)<\/p>/gim, "<p><b>Final Diagnosis:</b></p>");
  str = str.replaceAll(/<p>(Final Diagnosis:|FINAL DIAGNOSIS:|<em>FINAL DIAGNOSIS:<\/em>|<em>Final Diagnosis:<\/em>)<\/p>/gim, "<p><b>Final Diagnosis:</b></p>");
  // let subheadings = str.match(/<p>.*?<\/p>/g, "")
  // console.log(subheadings)

  //let referencesWithoutCr = references[0].replace(/^[\r\n]+|\.|[\r\n]+$/gim, "")

  // str = str.replaceAll(/Table(.*?)./gim, 'Table ')
  // str = str.replaceAll(/Figure(.*?):/gim || /Fig(.*?):/gim, 'Fig:')
  // str = str.replaceAll(/Title:/gim, '')
  // str = str.replaceAll(/Authors:/gim, '')
  // str = str.replaceAll(/Department Name:/gim, '')
  // str = str.replaceAll(/College Name:/gim, '')

  const divColumnString = 'deleteabovelines</div><div class="columns">';
  const divTitleImageString = `${headerImage.headerimage()}`;

  let findAbstractPattern;

  async function findAbstractPatternFunc() {
    if (str.match(/<p>Abstract<\/p>/gim)) {
      console.log(`${file} abstract found`);
      return str.match(/<p>Abstract<\/p>/gim);
    } else if (str.match(/<p>Abstract(.*?):(.*?)<\/p>/gim)) {
      console.log(`${file} abstract found 1`);
      return str.match(/<p>Abstract(.*?):(.*?)<\/p>/gim);
    } else if (str.match(/<p><strong>Abstract<\/strong><\/p>/gim)) {
      console.log(`${file} abstract found 2`);
      return str.match(/<p><strong>Abstract<\/strong><\/p>/gim);
    } else if (str.match(/<p><strong>Abstract(.*?):(.*?)<\/strong><\/p>/gim)) {
      console.log(`${file} abstract found 4`);
      return str.match(/<p><strong>Abstract(.*?):(.*?)<\/strong><\/p>/gim);
    } else if (str.match(/<p><strong>Abstract<\/strong>(.*?):(.*?)<\/p>/gim)) {
      console.log(`${file} abstract found 3`);
      return str.match(/<p><strong>Abstract<\/strong>(.*?):(.*?)<\/p>/gim);
    } else if (str.match(/<p><em>Abstract<\/em><\/p>/gim)) {
      console.log(`${file} abstract found 5`);
      return str.match(/<p><em>Abstract<\/em><\/p>/gim);
    } else if (str.match(/<p><em>Abstract(.*?):(.*?)<\/em><\/p>/gim)) {
      console.log(`${file} abstract found 6`);
      return str.match(/<p><em>Abstract(.*?):(.*?)<\/em><\/p>/gim);
    } else if (
      str.match(/<p><strong><em>Abstract(.*?)<\/em><\/strong><\/p>/gim)
    ) {
      console.log(`${file} abstract found 7`);
      return str.match(/<p><strong><em>Abstract(.*?)<\/em><\/strong><\/p>/gim);
    } else if (str.match(/<p><strong><em>Abstract<\/em><\/strong>:<\/p>/gim)) {
      console.log(`${file} abstract found 8`);
      return str.match(/<p><strong><em>Abstract<\/em><\/strong>:<\/p>/gim);
    } else if (str.match(/<b>ABSTRACT(.*?)<\/b>/gim)) {
      console.log(`${file} abstract found 9`);
      return str.match(/<b>ABSTRACT(.*?)<\/b>/gim);
    }
    // for doc converted files
    else if (str.match(/<p(.*?)>Abstract(.*?)<\/p>/gims)) {
      console.log(`${file} abstract found 10`);
      return str.match(/<p(.*?)>Abstract(.*?)<\/p>/gims);
    } else if (str.match(/<h2><strong>Abstract<\/strong><\/h2>/gims)) {
      console.log(`${file} abstract found 11`);
      return str.match(/<h2><strong>Abstract<\/strong><\/h2>/gims);
    } else {
      console.log("abstract not found");
    }
  }

  let findIntroPattern;

  async function findIntroIndexFunc() {
    if (str.match(/<p>Introduction:<\/p>/gim)) {
      console.log(`${file} intro found`);
      return str.match(/<p>Introduction:<\/p>/gim);
    } else if (str.match(/<p><em>Introduction(.*?):(.*?)<\/em><\/p>/gim)) {
      console.log(`${file} intro found`);
      return str.match(/<p><em>Introduction(.*?):(.*?)<\/em><\/p>/gim);
    } else if (
      str.match(/<p><strong>Introduction(.*?):(.*?)<\/strong><\/p>/gim)
    ) {
      console.log(`${file} intro found`);
      return str.match(/<p><strong>Introduction(.*?):(.*?)<\/strong><\/p>/gim);
    } else if (
      str.match(/<p><strong>Introduction<\/strong>(.*?):(.*?)<\/p>/gim)
    ) {
      console.log(`${file} intro found`);
      return str.match(/<p><strong>Introduction<\/strong>(.*?):(.*?)<\/p>/gim);
    } else if (
      str.match(
        /<p><strong><em>Introduction(.*?):(.*?)<\/em><\/strong><\/p>/gim
      )
    ) {
      console.log(`${file} intro found`);
      return str.match(
        /<p><strong><em>Introduction(.*?):(.*?)<\/em><\/strong><\/p>/gim
      );
    } else if (str.match(/<p>Introduction<\/p>/gim)) {
      console.log(`${file} intro found`);
      return str.match(/<p>Introduction<\/p>/gim);
    } else if (str.match(/<p><em>Introduction<\/em><\/p>/gim)) {
      console.log(`${file} intro found`);
      return str.match(/<p><em>Introduction<\/em><\/p>/gim);
    } else if (str.match(/<p><strong>Introduction<\/strong><\/p>/gim)) {
      console.log(`${file} intro found`);
      return str.match(/<p><strong>Introduction<\/strong><\/p>/gim);
    } else if (
      str.match(/<p><strong><em>Introduction<\/em><\/strong><\/p>/gim)
    ) {
      console.log(`${file} intro found`);
      return str.match(/<p><strong><em>Introduction<\/em><\/strong><\/p>/gim);
    } else if (str.match(/<b>Introduction(.*?)<\/b>/gim)) {
      console.log(`${file} intro found`);
      return str.match(/<b>Introduction(.*?)<\/b>/gim);
    } else if (/Introduction/gims) {
      console.log(`${file} intro found`);
      return str.match(/Introduction/gims);
    } else {
      console.log("intro not found");
    }
  }



  findAbstractPattern = await findAbstractPatternFunc();
  findIntroPattern = await findIntroIndexFunc();

  const titlePattern = /<p><strong>(.*?)<\/strong><\/p>/gim;

  if (findAbstractPattern) {
    const findAbstractPatternString = findAbstractPattern[0];
    const findAbstractIndex = str.indexOf(findAbstractPatternString);
    str = await insert(str, divColumnString, findAbstractIndex);
  } else if (findIntroPattern) {
    let findIntroIndex = str.indexOf(findIntroPattern[0]);
    str = await insert(str, divColumnString, findIntroIndex);
  }
  //else {
  // const titleIndex = str.indexOf(str.match(titlePattern)[0])
  // str = insert(str, divColumnString, titleIndex)
  // str = await insert(str, divColumnString, 0)
  //}

  str = await insert(str, divTitleImageString, 0); //insert title-section div element
  let references = str.match(/(<p>|<strong>)*Reference((.|\n)*)/gim) || str.match(/(<p>|<strong>)*REFERENCE((.|\n)*)/gim)
  //console.log(references)
  let paragraphRemoved = references[0].replace("<p>", "")
  paragraphRemoved = references[0].replace("</p>", "")
  paragraphRemoved = references[0].replace("<strong>", "")
  paragraphRemoved = references[0].replace("</strong>", "")
  //console.log("paragraph replaced", paragraphRemoved)
  let referencesIndex = str.indexOf(references[0])
  let referenceString = `<div class="reference">${paragraphRemoved}</div>`
  str = str.replace(/(<p>|<strong>|<em>)Reference((.|\n)*)/gim, "") || str.replace(/(<p>|<strong>|<em>)REFERENCE((.|\n)*)/gim, "")
  str = await insert(str, referenceString, referencesIndex);

  str = str.replace(/<div class="reference">References:/gim, '<div style="margin-bottom: 12px"><b>References:</b></div><div class="refcontent">');
  str = str.replace(/<div class="reference">References/gim, '<div style="margin-bottom: 12px"><b>References:</b></div><div class="refcontent">');
  str = str.replace(/<div class="reference">Reference/gim, '<div style="margin-bottom: 12px"><b>References:</b></div><div class="refcontent">');
  str = str.replace(/<div class="reference">Reference:/gim, '<div style="margin-bottom: 12px"><b>References:</b></div><div class="refcontent">');
  str = str.replace(/<div class="reference"><p><strong>References:/gim, '<div style="margin-bottom: 12px"><b>References:</b></div><div class="refcontent">');
  str = str.replace(/<div class="reference"><p><strong>References/gim, '<div style="margin-bottom: 12px"><b>References:</b></div><div class="refcontent">');
  str = str.replace(/<div class="reference"><p><strong>Reference/gim, '<div style="margin-bottom: 12px"><b>References:</b></div><div class="refcontent">');
  str = str.replace(/<div class="reference"><p><strong>Reference:/gim, '<div style="margin-bottom: 12px"><b>References:</b></div><div class="refcontent">');
  str = str.replace(/<div class="reference"><p>REFERENCES:<\/p>/gim, '<div style="margin-bottom: 12px"><b>References:</b></div><div class="refcontent">');
  str = str.replace(/<div class="reference"><strong>REFERENCES(.*?)<\/p>/gim, '<div style="margin-bottom: 12px"><b>References:</b></div><div class="refcontent">');
  str = str.replace(/(Abstract|ABSTRACT|<em>ABSTRACT<\/em>|<em>Abstract<\/em>)/, '<b style="font-size: 18px">Abstract</b>');
  str = str.replace(/(Abstract:|ABSTRACT:|<em>ABSTRACT:<\/em>|<em>Abstract:<\/em>)/, '<b style="font-size: 18px"></b>Abstract:</b>');
  str = str.replace(/(Introduction|INTRODUCTION|<em>INTRODUCTION<\/em>|<em>Introduction<\/em>)/, '<b style="font-size: 18px">Introduction</b>');
  str = str.replace(/(Introduction:|INTRODUCTION:|<em>INTRODUCTION:<\/em>|<em>Introduction:<\/em>)/, '<b style="font-size: 18px">Introduction:</b>');
  str = str.replace(/Department of/gim, ", Department of");
  str = str.replace(/MADRAS MEDICAL COLLEGE/gim, "Madras Medical College");
  str = str.replace(/<p class="title-author">TIRUNELVELI MEDICAL COLLEGE/gim, "Tirunelveli Medical College");
  str = str.replace(/^\s*\n/gm, "")

  if (typeof author_name == "string") {
    str = str.replace(
      /deletebelowlines[\s\S]*deleteabovelines/gim,
      `${title} ${author_name} ${author_aff}`
    );
  }

  if (typeof author_name == "object") {
    let allauthordata = "";
    for (let j = 0; j < author_name.length; j++) {
      allauthordata = allauthordata + author_name[j] + author_aff[j];
    }
    str = str.replace(
      /deletebelowlines[\s\S]*deleteabovelines/gim,
      `${title}${allauthordata}`
    );
  }

  try {
    fs.writeFileSync(".\\" + `${file.split(".")[0]}` + "-inter" + ".htm", str);
  } catch (err) {
    console.log(err);
  }

  let html = { content: str };

  //const header = '<p style="float: right; font-family: arial; width: 100%; font-size: 8px"><b>An Initiative of The Tamil Nadu Dr. M.G.R. Medical University University Journal of Medicine and Medical Specialities</b></p>'
  let footer =
    '<span style="font-size: 10px; margin-left:525px"> <span class="pageNumber"></span> of <span class="totalPages"></span></span>';
  let header = `<p style="font-family: Arial, Helvetica, sans-serif; width: 50%; margin-left:47px; font-size: 10px; font-weight: normal;">TNMGR Univ Jo Med&Med 8(1):66-69</p>`;
  let options = {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    ignoreDefaultArgs: ["--disable-extensions"],
    displayHeaderFooter: true,
    footerTemplate: footer,
    headerTemplate: header,
    margin: { top: 60, right: 60, bottom: 60, left: 60 },
  };

  async function insert(main_string, ins_string, pos) {
    if (typeof pos == "undefined") {
      console.log("invalid position");
    }
    if (typeof ins_string == "undefined") {
      console.log("invalid string");
    }
    return main_string.slice(0, pos) + ins_string + main_string.slice(pos);
  }

  await html_to_pdf.generatePdf(html, options).then((pdfBuffer) => {
    try {
      fs.writeFile(
        ".\\" + `${file.split(".")[0]}` + ".pdf",
        pdfBuffer,
        function (err, result) {
          if (err) console.log("error", err);
          else {
            console.log(
              ".\\" + `${file.split(".")[0]}` + " - " + "PDF write 1 success"
            );
            if (fs.existsSync(".\\" + `${file.split(".")[0]}` + ".pdf")) {
              let dataBuffer = fs.readFileSync(
                ".\\" + `${file.split(".")[0]}` + ".pdf"
              );
              pdf_parse(dataBuffer).then(function (data) {
                let lastpageno = sessionstorage.getItem("lastpageno");
                sessionstorage.setItem(
                  "lastpageno",
                  lastpageno + data.numpages
                );
                //footer = '<span style="font-size: 10px; margin-left:525px"> <span class="pageNumber"></span> of <span class="totalPages"></span></span>'
                //footer = `<span style="font-size: 10px; margin-left:525px"> ${lastpageno + 1} of ${lastpageno + data.numpages-1}`
                footer = "<p></p>";
                header = `<p style="font-family: Arial, Helvetica, sans-serif; width: 50%; margin-left:47px; font-size: 10px; font-weight: normal;">TNMGRMU Agathiyam 1(1):${lastpageno} - ${lastpageno + data.numpages - 1
                  }</p>`;
                options = {
                  args: ["--no-sandbox", "--disable-setuid-sandbox"],
                  ignoreDefaultArgs: ["--disable-extensions"],
                  displayHeaderFooter: true,
                  footerTemplate: footer,
                  headerTemplate: header,
                  margin: { top: 60, right: 60, bottom: 60, left: 60 },
                };
                html_to_pdf.generatePdf(html, options).then((pdfBuffer) => {
                  try {
                    fs.writeFile(
                      ".\\" + `${file.split(".")[0]}` + ".pdf",
                      pdfBuffer,
                      function (err, result) {
                        if (err) console.log("error", err);
                        else {
                          console.log(
                            lastpageno + " " + "-------------------------"
                          );
                          console.log(
                            ".\\" +
                            `${file.split(".")[0]}` +
                            " - " +
                            "PDF write 2 success"
                          );
                          runpdflib.run(
                            ".\\" + `${file.split(".")[0]}` + ".pdf",
                            lastpageno
                          );
                        }
                      }
                    );
                  } catch (err) {
                    console.log(err);
                  }
                });
              });
            }
            //if(fs.existsSync('./batch-sample/articles/Vol 8-Issue-1-2021/4287/submission/review/4287-6412-1-RV.pdf'))
            //fs.unlinkSync(filename)
          }
        }
      );
    } catch (err) {
      console.log(err);
    }
  });
}

//htmlprocessing("batch-sample/articles/Vol 8-Issue-1-2021/4287/submission/review/4287-6412-1-RV.htm")

module.exports = { htmlprocessing };

  // async function findAbstractIndexFunc(str, patternString) {
  //   return str.indexOf(patternString);
  // }

  // findAbstractPatternFunc().then((res) => {
  //   if (res) {
  //     console.log(res);
  //     findAbstractPattern = res;
  //     if (findAbstractPattern) {
  //       const findAbstractPatternString = findAbstractPattern[0];
  //       findAbstractIndexFunc(str, findAbstractPatternString).then((res) => {
  //         const findAbstractIndex = res;
  //         str = insert(str, divColumnString, findAbstractIndex);
  //       });
  //     }
  //   } else {
  //     findIntroIndexFunc().then((res) => {
  //       findIntroPattern = res;
  //       if (findIntroPattern) {
  //         let findIntroIndex = str.indexOf(findIntroPattern[0]);
  //         str = insert(str, divColumnString, findIntroIndex);
  //       }
  //     });
  //   }
  // });

// import html_to_pdf from "html-pdf-node"
// import fs from "node:fs"
// import path from "node:path"
// import headerImage from './headerimage.js'
// import readline from "node:readline"

// const stream = fs.createReadStream("docxfilepaths1.csv");
// const rl = readline.createInterface({ input: stream });
// let csvdata = [];

// rl.on("line", (row) => {
//     csvdata.push(row.split(","));
// });

// rl.on("close", () => {
//     for (let i in csvdata){
//         console.log(csvdata[i][0])
//         htmlprocessing(csvdata[i][0])
//     }
// });
// }

// const imagePatternString = str.match(/<img src=(.*?)\/>/gim)
// const figPatternString = str.match(/<p>fig(.*?)<\/p>/gim)
// imagePatternString.forEach((data, index) =>{
//     individualImageIndex = str.indexOf(data)
//     findIndexImage.push(individualImageIndex)
//     str = str.replace(imagePatternString[index],'')
//     str = str.replace(figPatternString[index],'')
//     str = insert(str,`<img src='${imageStringArr[index]}'/>`+figPatternString[index], findIndexImage[index])
//     mainStr = str
// })

// fs.writeFile('59-101-1-RV-image.htm', str, function(err, result) {
//     if(err) console.log('error', err);
//     else{
//         console.log("html file write success")
//         //fs.unlinkSync(filename)
//     }
// });

//if(str.match(findAbstractPattern)){
// str = insert(str, findAbstractPatternString, findIndex)
//}

//insert abstract pattern before introduction or case study
//if(str.indexOf("<p><strong>Abstract</strong></p>")){
//findAbstractIndex = str.indexOf("<p><strong>Abstract</strong></p>")

// str = str.replace(/<p>Title:<\/p><p><b>/gim, '')
// str = str.replace(/<p>Department Name:<\/p><p class="title-author"><b>/gim, '')
// str = str.replace(/<p>College Name:<\/p><p class="title-author"><b>/gim, '')
// str = str.replace(/<p>Authors:<\/p><p class="title-author"><b>/gim, '')

// const imagePatternString = str.match(/<img src=(.*?)\/>/gim)
// const figPatternString = str.match(/<p>Figure(.*?)<\/p>/gim)
//                         || str.match(/<p>fig(.*?)<\/p>/gim)
//                         || str.match(/<p>(.*?)<\/p>/gim)
//                         || str.match(/<p>figure(.*?)<\/p>/gim)
//                         || str.match(/<p><strong>Figure(.*?)<\/strong><\/p>/gim)
//                         || str.match(/<p><strong>fig(.*?)<\/strong><\/p>/gim)
//                         || str.match(/<p><strong>(.*?)<\/strong><\/p>/gim)
//                         || str.match(/<p><strong>figure(.*?)<\/strong><\/p>/gim)
// console.log(figPatternString)
// let findIndexImage = []
// imagePatternString.forEach((data, index) =>{
//     let individualImageIndex = str.toString().indexOf(data)
//     findIndexImage.push(individualImageIndex)
//     str = str.toString().replace(imagePatternString[index],'')
//     str = str.replace(figPatternString[index],'')
//     str = insert(str,imagePatternString[index]+figPatternString[index],findIndexImage[index])
// })
