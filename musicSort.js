#!/usr/bin/env node


const { askName, copySong, copyFilteredSongs, createPlaylist, getMetadata } = require("./utils.js");
const { collectMusic } = require('./collectMusic.js');
const { filterMusic } = require('./filterMusic.js');
const path = require('path');
const fs = require('fs/promises');
const selectMenu = require('@inquirer/select').default;



async function main() { 

while (true) { 
const action = await selectMenu(
{ message: 'Выбери действие:', choices: [ 
{ name: '1. Собрать треки в папку', value: 'collect' },
{ name: '2. Найти по запросу', value: 'filter' }, 
{ name: '3. Выйти', value: 'exit' } ] });

if (action === 'exit') {
  console.log('Выход...');
  break;
}

if (action === 'collect') {
  const searchPath = await askName('Укажи путь для поиска музыки: ');
  const excludeDir = await askName('Укажи папку для исключения (относительно предыдущего пути): ');
  await collectMusic(searchPath, excludeDir);
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
  //{ name: '1. Скопировать', value: 'copy' },
      { name: '2. Создать плейлист', value: 'playlist' },
      { name: '3. Вернуться в меню', value: 'back' }
    ]
  });

  if (subAction === 'copy') {
    const dest = normalizePath(await askName('Куда копировать?: '));
    await copyFilteredSongs(filteredSongs, dest);
  }
    else if (subAction === 'playlist') {
    await createPlaylist(filteredSongs, inputPath);
  } else {
    console.log('Возврат в главное меню...');
  }

}

}
}


main();

