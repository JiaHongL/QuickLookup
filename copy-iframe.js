const fs = require("fs-extra");

const sourceFolderPath = "src/iframe";
const targetFolderPath = "dist/quick-lookup/";

const args = process.argv.slice(2);

async function copyIframe() {
  try {
    await fs.copy(sourceFolderPath, targetFolderPath, { recursive: true });
  } catch (err) {
    console.error("發生錯誤：", err);
  }
}

copyIframe();
