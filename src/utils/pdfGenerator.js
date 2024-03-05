const puppeteer = require('puppeteer');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

// Function to render EJS template to HTML and convert it to PDF with a unique file name
exports.renderToPDF = async (data) => {
  // Render EJS template with data
  const htmlContent = await ejs.renderFile(`./views/${data.temp}.ejs`, { data });
  const ssPath = './uploads/pdfs/page-render.png';

  // Launch puppeteer browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({width: 2480, height: 3508});
  await page.setContent(htmlContent, {
    waitUntil: 'networkidle2'
  });
  await page.screenshot({path: ssPath});

  // Generate a unique file name using a timestamp
  const timestamp = Date.now();
  const uniqueFileName = `${data.temp}-${timestamp}.pdf`; // Unique file name
  const pdfPath = `./uploads/pdfs/${uniqueFileName}`;

  await page.pdf({ 
    path: pdfPath, 
    printBackground: true, 
    pageRanges: '1',
    width: 2480,
    height: 3508,
    preferCSSPageSize: false
  });

  await browser.close();
  return pdfPath;
}