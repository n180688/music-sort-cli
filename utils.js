const { input } = require('@inquirer/prompts');
const fs = require('fs/promises');
const { parseFile } = require('music-metadata');
const path = require('path');


//запрос названия
async function askName(message) {
  return await input({ message });
}


//сохраняет массив треков в json
async function saveTracksToJSON(tracks, fileName = 'undefined.json') {
  const filePath = path.resolve(process.cwd(), fileName);

const formatted = tracks.map(track => ({
    title: track.title || '',
    artist: track.artist || '',
    duration: track.duration || '',
    path: track.path
  }));

const jsonData = JSON.stringify(formatted, null, 2);


  try {
    await fs.writeFile(filePath, jsonData, 'utf8');
    console.log(` Список сохранён в файл: ${filePath}`);
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






module.exports = { askName, copySong, copyFilteredSongs, createPlaylist,  normalizePath, saveTracksToJSON };

