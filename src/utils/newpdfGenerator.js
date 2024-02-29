// const ejs = require('ejs');
// const fs = require('fs');
// const { generatePdf } = require('html-pdf-node');

// // Function to render EJS template to HTML and convert it to PDF with a unique file name
// exports.renderToPDF = async (data) => {
//   // Render EJS template with data
//   const htmlContent = await ejs.renderFile(`./views/${data.temp}.ejs`, { data });
  
//   // Specify options for PDF generation
//   let options = {
//     args: ['--no-sandbox', '--disable-setuid-sandbox'],
//     path: `./uploads/pdfs/${data.temp}-${Date.now()}.pdf`,
//     displayHeaderFooter: false,
//     printBackground: true,
//     pageRanges: '1',
//     format: 'A4',
//     width: 2480,
//     height: 3508,
//     preferCSSPageSize: false
//   };

//   // Generate PDF from HTML content
//   let file = { content: htmlContent };
//   try {
//     await generatePdf(file, options).then(pdfBuffer => {
//       console.log("PDF Buffer:-", pdfBuffer);
//     });

//     // Return the PDF file path
//     return options.path;
//   } catch (error) {
//     console.error("Error generating PDF:", error);
//     throw error; // Or handle error as needed
//   }
// }
