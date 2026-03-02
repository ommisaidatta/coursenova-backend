const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const certificateTemplate = require("../templates/certificateTemplate");

const generateCertificatePDF = async (data) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  const html = certificateTemplate({
    ...data,
    issuedDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  });

  const certificatesDir = path.join(__dirname, "../certificates");

  if (!fs.existsSync(certificatesDir)) {
    fs.mkdirSync(certificatesDir);
  }

  await page.setContent(html, { waitUntil: "networkidle0" });

  const fileName = `certificate-${data.certificateId}.pdf`;
  const filePath = path.join(certificatesDir, fileName);

  await page.pdf({
    path: filePath,
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  return fileName;
};

module.exports = generateCertificatePDF;
