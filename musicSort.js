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
  await filterMusic(inputPath, filterWords);
}

}
}


main();

