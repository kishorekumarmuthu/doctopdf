var express = require("express");
var path = require("path");
const app = express();
const htmltopdf = require("./htmltopdf");
const mammothtohtml = require("./docxtohtml");
const finddocxhtmlfiles = require("./finddocxhtmlfiles");
const sessionstorage = require("sessionstorage");
const readline = require("readline");

var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "kishore0906",
  database: "mgr univ",
});

connection.connect();

const batchfilepath =
  "./articles/1081";

async function findfiles() {
  await finddocxhtmlfiles.FindDocxFiles(batchfilepath);
  if (finddocxhtmlfiles.docxFiles.length != 0) {
    for (const file of finddocxhtmlfiles.docxFiles) {
      mammothtohtml.mammothtohtml(file);
    }
  }
  await finddocxhtmlfiles.FindHtmFiles(batchfilepath);
}

findfiles().then(() => {
  console.log(finddocxhtmlfiles.docxFiles);
  console.log(finddocxhtmlfiles.htmFiles);
});

app.get("/", async (req, res) => {
  async function runHtmlFiles() {
    if (finddocxhtmlfiles.htmFiles.length != 0) {
      for (const file of finddocxhtmlfiles.htmFiles) {
        //await htmlprocessing(file)
        const filepath = file;
        const filenamedocx = path.parse(filepath).name + ".docx";
        console.log(filenamedocx);
        //const filenamedoc = path.parse(filepath).name + ".doc"
        connection.query(
          "select distinct t1.Authors_Author_ID,t1.Authors_First_Name,t1.Authors_Last_Name,t1.Author_Aff_Value,t1.Article_Title_Value, t2.Author_Bio_Value from ((SELECT distinct a4.article_id as 'Article_ID',a3.setting_name as 'Article_Title', a3.setting_value as 'Article_Title_Value', a2.setting_name as 'Author_Aff', a2.setting_value as 'Author_Aff_Value', a1.submission_id as 'Authors_Submission_ID', a1.author_id as 'Authors_Author_ID', a1.first_name as 'Authors_First_Name', a1.last_name as 'Authors_Last_Name' FROM article_files as a4 join authors as a1 join article_settings as a3 join author_settings as a2 on a1.author_id = a2.author_id and a4.article_id=a1.submission_id and a4.article_id=a3.article_id where a4.file_name = '" +
          filenamedocx +
          "' and a3.setting_name = 'title' and a2.setting_name = 'affiliation') as t1, (SELECT distinct a4.article_id as 'Article_ID', a3.setting_name as 'Article_Title', a3.setting_value as 'Article_Title_Value', a2.setting_name as 'Author_Bio', a2.setting_value as 'Author_Bio_Value', a1.submission_id as 'Authors_Submission_ID', a1.author_id as 'Authors_Author_ID', a1.first_name as 'Authors_First_Name', a1.last_name as 'Authors_Last_Name' FROM article_files as a4 join authors as a1 join article_settings as a3 join author_settings as a2 on a1.author_id = a2.author_id and a4.article_id=a1.submission_id and a4.article_id=a3.article_id where a4.file_name = '" +
          filenamedocx +
          "' and a3.setting_name = 'title' and a2.setting_name = 'biography') as t2) where t1.Authors_Author_ID = t2.Authors_Author_ID",
          function (error, results, fields) {
            if (error) throw error;
            else {
              const numofrows = results.length;
              lastpageno = sessionstorage.setItem("lastpageno", 1);
              if (numofrows == 1) {
                // if(results[0].Author_Aff_Value.match(/department[\s\S]*/gim||/institute[\s\S]*/gim)){
                //     results[0].Author_Aff_Value = results[0].Author_Aff_Value.replace(/department/gim,'<br><p class="title-author">Department')
                //     console.log(results[0].Author_Aff_Value)
                // }
                let transformedTitle = results[0].Article_Title_Value.toLowerCase()
                let titleArr = transformedTitle.split(" ")
                for (var i = 0; i < titleArr.length; i++) {
                  if (titleArr[i] != "-" && titleArr[i] != "and" && titleArr[i] != "is" && titleArr[i] != "with" && titleArr[i] != "at" && titleArr[i] != "for" && titleArr[i] != "of" && titleArr[i] != "as" && titleArr[i] != "in" && titleArr[i] != "its") {
                    titleArr[i] = titleArr[i].charAt(0).toUpperCase() + titleArr[i].slice(1);
                    //console.log(titleArr[i])
                  }
                }
                transformedTitle = titleArr.join(" ")
                let title = `<p><b>${transformedTitle}</b></p>`;
                title = title
                  .replaceAll(/â€“/gim, "-")
                  .replaceAll(/â€œâ€œ/gim, "")
                  .replaceAll(/â€/gim, "");

                let authorFirstNameLowerCase, authorLastNameLowerCase, firstLetterUpperCaseFirstName, firstLetterUpperCaseLastName
                if (results[0].Authors_First_Name) {
                  authorFirstNameLowerCase = results[0].Authors_First_Name.toLowerCase()
                  firstLetterUpperCaseFirstName = authorFirstNameLowerCase.charAt(0).toUpperCase() + authorFirstNameLowerCase.slice(1)
                }
                if (results[0].Authors_Last_Name) {
                  authorLastNameLowerCase = results[0].Authors_Last_Name.toLowerCase()
                  firstLetterUpperCaseLastName = results[0].Authors_Last_Name.charAt(0).toUpperCase() + authorLastNameLowerCase.slice(1)
                }

                let author_name =
                  `<p class="title-author">${firstLetterUpperCaseFirstName}` +
                  " " +
                  `${firstLetterUpperCaseLastName}</p>`;
                console.log(results[0].Author_Aff_Value)
                let author_aff = `<p class="title-author">${results[0].Author_Aff_Value}</p>`;
                author_aff = author_aff
                  .replaceAll(/â€“/gim, "-")
                  .replaceAll(/â€œâ€œ/gim, "")
                  .replaceAll(/â€/gim, "");

                //console.log(author_aff);
                //let author_bio = `<p class="title-author">${results[0].Author_Bio_Value}</p>`
                collegeAndDept(author_aff).then((collegeDeptInfo) => {
                  htmltopdf.htmlprocessing(file, title, author_name, collegeDeptInfo);
                })
              }
              if (numofrows > 1) {
                let transformedTitle = results[0].Article_Title_Value.toLowerCase()
                let titleArr = transformedTitle.split(" ")
                for (var i = 0; i < titleArr.length; i++) {
                  if (titleArr[i] != "-" && titleArr[i] != "and" && titleArr[i] != "is" && titleArr[i] != "with" && titleArr[i] != "at" && titleArr[i] != "for" && titleArr[i] != "of" && titleArr[i] != "as" && titleArr[i] != "in" && titleArr[i] != "its") {
                    titleArr[i] = titleArr[i].charAt(0).toUpperCase() + titleArr[i].slice(1);
                    //console.log(titleArr[i])
                  }
                }
                transformedTitle = titleArr.join(" ")
                let title = `<p><b>${transformedTitle}</b></p>`;
                //let title = `<p><b>${results[0].Article_Title_Value}</b></p>`;
                title = title
                  .replaceAll(/â€“/gim, "-")
                  .replaceAll(/â€œâ€œ/gim, "")
                  .replaceAll(/â€/gim, "");
                let author_name = [];
                let author_aff = [];
                for (const row of results) {
                  if (row.Authors_First_Name) {
                    authorFirstNameLowerCase = row.Authors_First_Name.toLowerCase()
                    firstLetterUpperCaseFirstName = authorFirstNameLowerCase.charAt(0).toUpperCase() + authorFirstNameLowerCase.slice(1)
                  }
                  if (row.Authors_Last_Name) {
                    authorLastNameLowerCase = row.Authors_Last_Name.toLowerCase()
                    firstLetterUpperCaseLastName = authorLastNameLowerCase.charAt(0).toUpperCase() + authorLastNameLowerCase.slice(1)
                  }
                  author_name.push(
                    `<p class="title-author">${firstLetterUpperCaseFirstName}` +
                    " " +
                    `${firstLetterUpperCaseLastName}</p>`
                  );

                  collegeAndDept(row.Author_Aff_Value).then((result) => {
                    author_aff.push(
                      `<p class="title-author">${result}</p>`
                        .replaceAll(/â€“/gim, "-")
                        .replaceAll(/â€œâ€œ/gim, "")
                        .replaceAll(/â€/gim, "")
                    );
                  })
                  //author_bio.push(`<p class="title-author">${row.Author_Bio_Value}</p>`)
                  // let new_author_bio = row.Author_Bio_Value.replaceAll('<p>','')
                  // new_author_bio = row.Author_Bio_Value.replaceAll('</p><p>','')
                  // new_author_bio = row.Author_Bio_Value.replaceAll('</p>','')
                  // console.log(new_author_bio)
                }
                htmltopdf.htmlprocessing(file, title, author_name, author_aff);
              }
            }
          }
        );
      }
    }
  }
  runHtmlFiles().then(console.log("file converted"));
  res.send("done");
});

async function collegeAndDept(Author_Aff_Value) {
  if (Author_Aff_Value.includes("MADRAS MEDICAL COLLEGE") || Author_Aff_Value.includes("Madras Medical College")) {
    //console.log("match")
    return Author_Aff_Value = Author_Aff_Value.replace(/(MADRAS MEDICAL COLLEGE|Madras Medical College)/gim, "Madras Medical College,")
  }
  if (Author_Aff_Value.includes("TIRUNELVELI MEDICAL COLLEGE") || Author_Aff_Value.includes("Tirunelveli Medical College")) {
    //console.log("match")
    return Author_Aff_Value = Author_Aff_Value.replace(/(TIRUNELVELI MEDICAL COLLEGE|Tirunelveli Medical College)/gim, "Tirunelveli Medical College,")
  }
  if (Author_Aff_Value.includes("psg")) {
    return Author_Aff_Value = Author_Aff_Value.replace("psg", "PSG")
  }
  if (Author_Aff_Value.includes("SREE MOOKAMBIKA INSTITUTE OF MEDICAL SCIENCES")) {
    return Author_Aff_Value = Author_Aff_Value.replace("SREE MOOKAMBIKA INSTITUTE OF MEDICAL SCIENCES", "Sree Mookambika Institute Of Medical Sciences")
  }
  if (Author_Aff_Value.includes("KARPAGA VINAYAGA INSTITUTE OF MEDICAL SCIENCES AND RESEARCH INSTITUTE") || Author_Aff_Value.includes("KARPAGA VINAYAGA INSTITUTE OF MEDICAL SCIENCES")) {
    Author_Aff_Value = Author_Aff_Value.replace("KARPAGA VINAYAGA INSTITUTE OF MEDICAL SCIENCES AND RESEARCH INSTITUTE", "Karpaga Vinayaga Institute of Medical Sciences and Research Institute")
    Author_Aff_Value = Author_Aff_Value.replace("KARPAGA VINAYAGA INSTITUTE OF MEDICAL SCIENCES", "Karpaga Vinayaga Institute of Medical Sciences and Research Institute")
    return Author_Aff_Value
  }
  if (Author_Aff_Value.includes("PSG INSTITUTE OF MEDICAL SCIENCES AND RESEARCH") || Author_Aff_Value.includes("PSG Institute of Medical Sciences and Research")) {
    Author_Aff_Value = Author_Aff_Value.replace(/(PSG INSTITUTE OF MEDICAL SCIENCES AND RESEARCH | PSG Institute of Medical Sciences and Research)/gim, "PSG Institute of Medical Sciences and Research,")
    //Author_Aff_Value = Author_Aff_Value.replace(/PSG Institute of Medical Sciences and Research/g, "PSG Institute of Medical Sciences and Research,")
    return Author_Aff_Value
  }
}

app.listen(3002, () => {
  console.log("APP IS LISTENING ON PORT 3002!");
});

// if (author_aff.includes("MADRAS MEDICAL COLLEGE") || author_aff.includes("Madras Medical College")) {
                //   author_aff = author_aff.replace(/(MADRAS MEDICAL COLLEGE|Madras Medical College)/gim, "Madras Medical College,")
                // }
                // if (author_aff.includes("TIRUNELVELI MEDICAL COLLEGE") || author_aff.includes("Tirunelveli Medical College")) {
                //   author_aff = author_aff.replace(/(TIRUNELVELI MEDICAL COLLEGE|Tirunelveli Medical College)/gim, "Tirunelveli Medical College,")
                // }
                // if (author_aff.includes("psg")) {
                //   author_aff = author_aff.replace("psg", "PSG")
                // }
                // if (author_aff.includes("SREE MOOKAMBIKA INSTITUTE OF MEDICAL SCIENCES")) {
                //   author_aff = author_aff.replace("SREE MOOKAMBIKA INSTITUTE OF MEDICAL SCIENCES", "Sree Mookambika Institute Of Medical Sciences")
                // }
                // if (author_aff.includes("KARPAGA VINAYAGA INSTITUTE OF MEDICAL SCIENCES AND RESEARCH INSTITUTE") || author_aff.includes("KARPAGA VINAYAGA INSTITUTE OF MEDICAL SCIENCES")) {
                //   author_aff = author_aff.replace("KARPAGA VINAYAGA INSTITUTE OF MEDICAL SCIENCES AND RESEARCH INSTITUTE", "Karpaga Vinayaga Institute of Medical Sciences and Research Institute")
                //   author_aff = author_aff.replace("KARPAGA VINAYAGA INSTITUTE OF MEDICAL SCIENCES", "Karpaga Vinayaga Institute of Medical Sciences and Research Institute")
                // }
// if (row.Author_Aff_Value.includes("MADRAS MEDICAL COLLEGE")) {
                  //   //console.log("match")
                  //   row.Author_Aff_Value = row.Author_Aff_Value.replace("MADRAS MEDICAL COLLEGE", "Madras Medical College,")
                  // }
                  // if (row.Author_Aff_Value.includes("TIRUNELVELI MEDICAL COLLEGE")) {
                  //   //console.log("match")
                  //   row.Author_Aff_Value = row.Author_Aff_Value.replace("TIRUNELVELI MEDICAL COLLEGE", "Tirunelveli Medical College,")
                  // }
                  // if (row.Author_Aff_Value.includes("psg")) {
                  //   row.Author_Aff_Value = row.Author_Aff_Value.replace("psg", "PSG")
                  // }
                  // if (row.Author_Aff_Value.includes("SREE MOOKAMBIKA INSTITUTE OF MEDICAL SCIENCES")) {
                  //   row.Author_Aff_Value = row.Author_Aff_Value.replace("SREE MOOKAMBIKA INSTITUTE OF MEDICAL SCIENCES", "Sree Mookambika Institute Of Medical Sciences")
                  // }
                  // // if (row.Author_Aff_Value.includes("KARPAGA VINAYAGA INSTITUTE OF MEDICAL SCIENCES")) {
                  // //   row.Author_Aff_Value = row.Author_Aff_Value.replace("KARPAGA VINAYAGA INSTITUTE OF MEDICAL SCIENCES", "Karpaga Vinayaga Institute of Medical Sciences")
                  // // }
                  // if (row.Author_Aff_Value.includes("KARPAGA VINAYAGA INSTITUTE OF MEDICAL SCIENCES AND RESEARCH INSTITUTE") || row.Author_Aff_Value.includes("KARPAGA VINAYAGA INSTITUTE OF MEDICAL SCIENCES")) {
                  //   row.Author_Aff_Value = row.Author_Aff_Value.replace("KARPAGA VINAYAGA INSTITUTE OF MEDICAL SCIENCES AND RESEARCH INSTITUTE", "Karpaga Vinayaga Institute of Medical Sciences and Research Institute")
                  //   row.Author_Aff_Value = row.Author_Aff_Value.replace("KARPAGA VINAYAGA INSTITUTE OF MEDICAL SCIENCES", "Karpaga Vinayaga Institute of Medical Sciences and Research Institute")
                  // }
