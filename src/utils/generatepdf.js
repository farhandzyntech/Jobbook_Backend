// const ejs = require('ejs');
// const pdf = require('html-pdf');
// const fs = require('fs');

// // Function to render EJS template to HTML and convert it to PDF with a unique file name
// exports.renderToPDF = async (data) => {
//   // Render EJS template with data
//   ejs.renderFile(`./views/${data.temp}.ejs`, { data }, (err, htmlContent) => {
//     if (err) {
//       console.error("Error rendering EJS:", err);
//       return;
//     }

//     // Define PDF options
//     const options = {
//       format: 'A4',
//       orientation: 'portrait',
//       border: '10mm',
//       pageRanges: '1',
//       printBackground: true
//     };

//     // Generate a unique file name using a timestamp
//     const timestamp = Date.now();
//     const uniqueFileName = `${data.temp}-${timestamp}.pdf`; // Unique file name
//     const pdfPath = `./uploads/pdfs/${uniqueFileName}`;

//     // Convert HTML content to PDF
//     pdf.create(htmlContent, options).toFile(pdfPath, (err, res) => {
//       if (err) {
//         console.error("Error creating PDF:", err);
//         return;
//       }
//       console.log("PDF created at:", res.filename);
//       // Optionally, return or process the PDF file path (res.filename) further
//     });
//   });
// }




// // const ejs = require('ejs');
// // const pdf = require('html-pdf');
// // const path = require('path');
// // const fs = require('fs');

// // // Function to render EJS template to HTML and convert it to PDF
// // async function renderToPDF(data) {
// //   return new Promise((resolve, reject) => {
// //     // Render EJS template with data
// //     ejs.renderFile(`./views/${data.temp}.ejs`, { data }, (err, html) => {
// //       // ejs.renderFile(path.join(__dirname, '../views/temp1.ejs'), { data }, (err, html) => {
// //       if (err) {
// //         reject(err);
// //       } else {
// //         // Define options for PDF
// //         const options = {
// //           format: 'A4',
// //           orientation: 'portrait',
// //           border: '10mm',
// //           // header: {
// //           //   height: '45mm',
// //           // },
// //           // footer: {
// //           //   height: '28mm',
// //           // },
// //           base: 'file://' + path.resolve(__dirname, '../public/'),
// //       pageRanges: '1',
// //       printBackground: true
// //         };
// //         `./views/${data.temp}.ejs`
// //         // Convert HTML to PDF
// //         pdf.create(html, options).toFile(`../uploads/pdfs/output.pdf`, (err, res) => {
// //           // pdf.create(html, options).toFile(path.join(__dirname, '../public/pdfs/output.pdf'), (err, res) => {
// //           if (err) {
// //             reject(err);
// //           } else {
// //             resolve(res.filename);
// //           }
// //         });
// //       }
// //     });
// //   });
// // }

// // module.exports.renderToPDF = renderToPDF;
