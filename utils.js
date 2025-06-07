const { input } = require('@inquirer/prompts');
const fs = require('fs/promises');
const fsS = require('fs');
const { parseFile } = require('music-metadata');
const path = require('path');
const archiver = require('archiver');



async function archiveFiles(inputPaths, outputDir, {
  archiveName = 'archive',
  log = false,
  flatten = true,
} = {}) {


if (!outputDir) {
  if (Array.isArray(inputPaths) && inputPaths.length > 0) {
    outputDir = path.dirname(inputPaths[0]); // та же папка, что и у первого трека
  } else if (typeof inputPaths === 'string') {
    outputDir = inputPaths; 
  } else {
    outputDir = process.cwd(); 
  }
}

  
outputDir = normalizePath(outputDir);

archiveName = `${archiveName}.zip`;

  let outputPath = path.join(outputDir, archiveName);
const ext = path.extname(archiveName);
const base = path.basename(archiveName, ext);

let count = 1;
while (fsS.existsSync(outputPath)) {
  outputPath = path.join(outputDir, `${base}(${count})${ext}`);
  count++;
}
  const output = fsS.createWriteStream(outputPath);
  const archive = archiver('zip', {
    zlib: { level: 1 },
  });

  archive.pipe(output);

const archiveFinished = new Promise((resolve, reject) => {
    output.on('close', () => {
  console.log(`✅ Архив успешно создан: ${outputPath}`);
  resolve();
});
    archive.on('error', reject);
  });

  if (Array.isArray(inputPaths)) {
    for (const filePath of inputPaths) {
      if (flatten) {
        archive.file(filePath, { name: path.basename(filePath) });
      } else {
        const relativePath = path.relative(process.cwd(), filePath);
        archive.file(filePath, { name: relativePath });
      }
    }
  } else if (typeof inputPaths === 'string') {
    archive.directory(inputPaths);
  } else {
    throw new Error('inputPaths должен быть строкой (папка) или массивом файлов');
  }

  archive.finalize();
await archiveFinished
}



//запрос названия
async function askName(message) {
  return await input({ message });
}


//сохраняет массив треков в json
async function saveTracksToJSON(tracks, fileName = 'undefined.json') {
  const filePath = path.resolve(process.cwd(), fileName);

  // Оставляем только mp3 
  const onlyMp3 = tracks.filter(track =>
    track.isMp3
  );

const formatted = onlyMp3.map(track => ({
    title: track.title || '',
    artist: track.artist || '',
    duration: track.duration || '',
    path: track.path,
    isMp3: track.isMp3
  }));

const jsonData = JSON.stringify(formatted, null, 2);


  try {
    await fs.writeFile(filePath, jsonData, 'utf8');
    console.log(`Всего без метаданных: ${tracks.length}\nИз них Mp3: ${onlyMp3.length}\n Список сохранён в файл: ${filePath}`);
  } catch (err) {
    console.error(`Не удалось сохранить JSON: ${err.message}`);
  }
}



//для термукса
function normalizePath(inputPath) {
  return path.resolve(process.env.HOME, inputPath) + '/';
}


//копирование
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




module.exports = { askName, copySong, copyFilteredSongs, createPlaylist,  normalizePath, saveTracksToJSON, archiveFiles };

