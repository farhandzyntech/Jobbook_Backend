const puppeteer = require('puppeteer');
const ejs = require('ejs');

// Function to render EJS template to HTML and convert it to PDF with a unique file name
exports.renderToPDF = async (data) => {
  // Render EJS template with data
  const htmlContent = await ejs.renderFile(`./views/${data.temp}.ejs`, { data });
  const ssPath = './uploads/pdfs/page-render.png';

  // Launch puppeteer browser with bundled Chromium
  // const browser = await puppeteer.launch({executablePath: puppeteer.executablePath()});
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
    // args: [
    //     '--no-sandbox',
    //     '--disable-setuid-sandbox',
    //     '--disable-dev-shm-usage',
    //     '--disable-accelerated-2d-canvas',
    //     '--no-first-run',
    //     '--no-zygote',
    //     '--single-process', // <- this one doesn't work on Windows
    //     '--disable-gpu',
    //     '--disable-extensions'
    // ],
    executablePath: puppeteer.executablePath()
  });
  const page = await browser.newPage();

  await page.setViewport({width: 2490, height: 3508});
  await page.setContent(htmlContent, {
    waitUntil: 'networkidle2'
  });
  // await page.goto('https://google.com', {waitUntil: 'networkidle2'});
  await page.screenshot({path: ssPath});

  // Generate a unique file name using a timestamp
  const timestamp = Date.now();
  const uniqueFileName = `${data.temp}-${timestamp}.pdf`; // Unique file name
  const pdfPath = `./uploads/pdfs/${uniqueFileName}`;

  await page.pdf({ 
    // path: pdfPath, 
    // printBackground: true, 
    // pageRanges: '1',
    // width: 2480,
    // height: 3508,
    // preferCSSPageSize: false,

    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    path: `./uploads/pdfs/${data.temp}-${Date.now()}.pdf`,
    displayHeaderFooter: false,
    printBackground: true,
    pageRanges: '1',
    format: 'A4',
    width: 2480,
    height: 3508,
    preferCSSPageSize: false
  });

  await browser.close();
  return pdfPath;
}

//--////////////////////////////////
//--////////////////////////////////
//--////////////////////////////////
//--////////////////////////////////
// const puppeteer = require('puppeteer');
// const ejs = require('ejs');
// const fs = require('fs');
// const path = require('path');

// // Function to render EJS template to HTML and convert it to PDF with a unique file name
// exports.renderToPDF = async (data) => {
//   // Render EJS template with data
//   const htmlContent = await ejs.renderFile(`./views/${data.temp}.ejs`, { data });
//   const ssPath = './uploads/pdfs/page-render.png';

//   // Launch puppeteer browser
//   // const browser = await puppeteer.launch();
//   // const page = await browser.newPage();

//   // Launch puppeteer browser with bundled Chromium
//   const browser = await puppeteer.launch({executablePath: puppeteer.executablePath()});
//   const page = await browser.newPage();

//   await page.setViewport({width: 2490, height: 3508});
//   await page.setContent(htmlContent, {
//     waitUntil: 'networkidle2'
//   });
//   await page.screenshot({path: ssPath});

//   // Generate a unique file name using a timestamp
//   const timestamp = Date.now();
//   const uniqueFileName = `${data.temp}-${timestamp}.pdf`; // Unique file name
//   const pdfPath = `./uploads/pdfs/${uniqueFileName}`;

//   await page.pdf({ 
//     path: pdfPath, 
//     printBackground: true, 
//     pageRanges: '1',
//     width: 2480,
//     height: 3508,
//     preferCSSPageSize: false
//   });

//   await browser.close();
//   return pdfPath;
// }
//--////////////////////////////////
//--////////////////////////////////
//--////////////////////////////////
//--////////////////////////////////
// const puppeteer = require('puppeteer');
// const ejs = require('ejs') 
// const fs = require('fs') 
// const path = require('path') 

// // Function to render EJS template to HTML and convert it to PDF
// exports.renderToPDF = async (data)=> {
//   // Render EJS template with data
//   // console.log(__dirname);
//   // console.log(__filename);
// //   E:\\Jobbook_Backend\\src\\views\\template.ejs
//   const htmlContent = await ejs.renderFile(`E:/Jobbook_Backend/views/${data.temp}.ejs`, { data });
// //   const htmlContent = await ejs.renderFile(path.join(__dirname, '../views/template.ejs'), { data });
// const ssPath = 'E:/Jobbook_Backend/uploads/pdfs/page-render.png';

//   // Launch puppeteer browser
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   await page.setViewport({width: 2490, height: 3508});
//   // await page.setContent(htmlContent);
//   await page.setContent(htmlContent, {
//     waitUntil: 'networkidle2'
//   });
//   await page.screenshot({path: ssPath});
//   // await page.setViewport({width: 2480, height: 3508});

//   // Generate PDF from HTML
//   const pdfPath = `E:/Jobbook_Backend/uploads/pdfs/${data.temp}.pdf`;
// //   const pdfPath = path.join(__dirname, '../uploads/pdfs', 'output.pdf');
// //   const pdfPath = path.join(__dirname, '../public/pdfs', 'output.pdf');
//   await page.pdf({ 
//     path: pdfPath, 
//     // format: 'A4',
//     printBackground: true, 
//     // margin: {top: 0, left: 0, right: 0, bottom: 0 }, 
//     displayHeaderFooter: false,
//     // margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
//     pageRanges: '1',
//     width: 2480,
//     height: 3508,
//     preferCSSPageSize: false
//   });
//   await browser.close();
//   return pdfPath;
// }
//--////////////////////////////////
//--////////////////////////////////
//--////////////////////////////////
//--////////////////////////////////