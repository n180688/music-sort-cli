const { normalizePath } = require('./utils.js');
const fs = require('fs/promises');
const { parseFile } = require('music-metadata');
const path = require('path');
const pLimit = require('p-limit').default;
const cliProgress = require('cli-progress');
const NodeID3 = require('node-id3');



async function writeMetadataFromFile(filePath = './undefined.json') {
  try {
    const fullPath = path.resolve(filePath);
    const json = await fs.readFile(fullPath, 'utf-8');
    const songs = JSON.parse(json);

    if (!Array.isArray(songs)) {
      console.log('Файл не содержит массив объектов');
      return;
    }

    let errorCount = 0;

    for (const song of songs) {
      if (!song.title || !song.artist) {
        errorCount ++;
	continue;
      }

      try {
	const metadata = {title: `${song.title}` , artist: `${song.artist}` };
	
	await NodeID3.removeTags(song.path);
        await NodeID3.write(metadata, song.path);
        console.log(`✓ Вписано: ${song.title} - ${song.artist}`);
      } catch (err) {
        console.log(`⚠️ Ошибка при записи: ${song.path}`, err.message);
        errorCount++;
      }
    }

    if (errorCount === 0) {
      await fs.unlink(fullPath);
      console.log(`✅ Все метаданные успешно вписаны. Файл удален.`);
    } else {
      console.log(`⚠️ Некоторые треки не обработаны. Файл не удален.`);
    }

  } catch (err) {
    console.log(`❌ Ошибка при чтении файла: ${filePath}`, err.message);
  }
}




const limit = pLimit(5);

async function getAllMetadataFromDir(inputPath) {
  inputPath = normalizePath(inputPath);
  const files = await fs.readdir(inputPath);
  console.log(`Всего файлов найдено: ${files.length}`);

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(files.length, 0);

  const mdPromises = files.map(file =>
    limit(async () => {
      const metadata = await getMetadata(path.join(inputPath, file));
      bar.increment();
      return metadata;
    })
  );

  const allMetadata = await Promise.all(mdPromises);
  bar.stop();
  return allMetadata;
}



//считывание метаданных
async function getMetadata(filePath) {
  try {
    const metadata = await parseFile(filePath);
return {
        title: metadata.common.title,
        artist: metadata.common.artist,
        duration: `${Math.floor(metadata.format.duration/60)}:${Math.round(metadata.format.duration%60).toString().padStart(2, '0')}`,
        path: filePath,
        }

} catch (error) {
        return{
                path: filePath,
                error: error.message,
        }

  }
};



module.exports = { getMetadata, getAllMetadataFromDir, writeMetadataFromFile  };
