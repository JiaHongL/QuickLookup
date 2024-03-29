const fs = require("fs-extra");

const sourceFolderPath = "src/_locales";
const targetFolderPath = "dist/quick-lookup/_locales/";

const args = process.argv.slice(2);
const environment = args[0];

async function copyLocales() {
  try {
    await fs.copy(sourceFolderPath, targetFolderPath, { recursive: true });
  } catch (err) {
    console.error("發生錯誤：", err);
  }
}

copyLocales();
