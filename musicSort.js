#!/usr/bin/env node


const { askName, copySong, copyFilteredSongs, createPlaylist, archiveFiles } = require("./utils.js");
const { collectMusic } = require('./collectMusic.js');
const { filterMusic, findSongsWithoutMetadata } = require('./filterMusic.js');
const { writeMetadataFromFile } = require('./metadata.js');
const path = require('path');
const fs = require('fs/promises');
const selectMenu = require('@inquirer/select').default;



async function main() { 

while (true) { 
const action = await selectMenu(
{ message: 'Выбери действие:', choices: [ 
{ name: '1. Собрать треки в папку', value: 'collect' },
{ name: '2. Найти по запросу', value: 'filter' },
{ name: '3. Найти песни без метаданных', value: 'missingMeta' },
{ name: '4. Вписать метаданные из файла', value: 'writeMeta' }, 
{ name: '5. Выйти', value: 'exit' } ] });

if (action === 'exit') {
  console.log('Выход...');
  break;
}

if (action === 'collect') {
  const searchPath = await askName('Укажи путь для поиска музыки: ');
  const excludeDir = await askName('Укажи папку для исключения (относительно предыдущего пути): ');
  await collectMusic(searchPath, excludeDir);
}

if (action === 'missingMeta') {
  const inputPath = await askName('Укажи путь к папке с музыкой: ');
  await findSongsWithoutMetadata(inputPath);
}

if (action === 'writeMeta') {
  const file = await askName('Укажи путь к JSON с треками (по умолчанию ./undefined.json): ');
  const filePath = file.trim() === '' ? './undefined.json' : file;
  await writeMetadataFromFile(filePath);
}

if (action === 'filter') {
  const inputPath = await askName('Укажи путь к папке с музыкой: ');
  const query = await askName('Укажи слова для фильтрации через пробел: ');
  const filterWords = query.split(' ').filter(Boolean);
  //получаем найденное
  const filteredSongs =  await filterMusic(inputPath, filterWords);
	

	const subAction = await selectMenu({
    message: 'Что сделать с найденными файлами?',
    choices: [
      { name: '1. Скопировать', value: 'copy' },
      { name: '2. Создать плейлист', value: 'playlist' },
      { name: '3. Вернуться в меню', value: 'back' },
      { name: '4. Архивировать', value: 'archive'}
    ]
  });

  if (subAction === 'copy') {
    await copyFilteredSongs(filteredSongs);
  } else if (subAction === 'archive'){
    const files = filteredSongs.map((item) => {return item.path});
    const archiveName = await askName('Обзови архив:');
     await archiveFiles(files, inputPath, {archiveName});
  }  else if (subAction === 'playlist') {
    await createPlaylist(filteredSongs, inputPath);
  } else {
    console.log('Возврат в главное меню...');
  }

}

}
}


main();

