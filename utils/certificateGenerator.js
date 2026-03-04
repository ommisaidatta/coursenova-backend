const fs = require("fs");
const path = require("path");
const { getBrowser } = require("../utils/browser");
const certificateTemplate = require("../templates/certificateTemplate");

const generateCertificatePDF = async (data) => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
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

    const safeId = data.certificateId.replace(/\s+/g, "-");
    const fileName = `certificate-${safeId}.pdf`;
    const filePath = path.join(certificatesDir, fileName);

    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
    });

    return fileName;
  } finally {
    await page.close();
  }
};

module.exports = generateCertificatePDF;
