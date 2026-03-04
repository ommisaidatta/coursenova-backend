const puppeteer = require("puppeteer");

let browserInstance = null;

const getBrowser = async () => {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    // console.log("Puppeteer browser launched");
  }

  return browserInstance;
};

const closeBrowser = async () => {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
    // console.log("Puppeteer browser closed");
  }
};

module.exports = {
  getBrowser,
  closeBrowser,
};
