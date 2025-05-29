const { input } = require('@inquirer/prompts');
const fs = require('fs/promises');
const { parseFile } = require('music-metadata');
const path = require('path');
const pLimit = require('p-limit').default;
const cliProgress = require('cli-progress');


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



//запрос названия
async function askName(message) {
  return await input({ message });
}


//для термукса
function normalizePath(inputPath) {
  return path.resolve(process.env.HOME, inputPath) + '/';
}



async function copySong(file, destinationDir) {
  const filename = path.basename(file);
  const destPath = path.join(destinationDir, filename);
  await fs.copyFile(file, destPath);
console.log(`${filename} скопирован в ${destPath}`);
}


async function copyFilteredSongs(filteredSongs) {
  const folderName = await askName('Как назвать новую папку для копий? ');
  const pathToCopy = normalizePath(await askName('Куда копировать?'));
  const  destinationDir = path.join(pathToCopy, folderName);

  await fs.mkdir(destinationDir, { recursive: true });

  for (const song of filteredSongs) {
    try {
      await copySong(song.path, destinationDir);
      console.log(`Скопировано: ${song.path}`);
    } catch (err) {
      console.error(`Ошибка при копировании ${song.path}: ${err.message}`);
    }
  }

  console.log(`Готово! Все файлы скопированы в ${destinationDir}`);
}


//создание плейлиста 
 async function createPlaylist(songs, musicPath) {
  const playlistName = await askName('Введите имя для плейлиста (без расширения): ');
musicPath = normalizePath(musicPath);
  const playlistPath = path.join(musicPath, `${playlistName}.m3u`);

  const lines = ['#EXTM3U'];

  for (const song of songs) {
    lines.push(song.path);
  }

  await fs.writeFile(playlistPath, lines.join('\n'), { encoding: 'utf8', flag: 'w' });
  console.log(`Плейлист создан: ${playlistPath}`);
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



module.exports = { askName, copySong, copyFilteredSongs, createPlaylist, getMetadata, normalizePath, getAllMetadataFromDir  };

