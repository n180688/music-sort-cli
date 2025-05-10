const fs = require('fs').promises;
const path = require('path');

async function moveFile(srcPath, destDir) {
  try {
    const fileName = path.basename(srcPath);
    const destPath = path.join(destDir, fileName);


    await fs.rename(srcPath, destPath);

    console.log(`Перемещено: ${fileName}`);
    return destPath;
  } catch (err) {
    console.error(`Ошибка при перемещении ${srcPath}:`, err.message);
    return null;
  }
}


module.exports = { moveFile };
