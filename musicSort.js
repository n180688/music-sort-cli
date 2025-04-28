#!/usr/bin/env node


const fs = require('fs/promises');
const path = require('path');
const { parseFile } = require('music-metadata');


const inputPath = process.argv[2];
const filterWords  = process.argv.slice(3);

//проверка аргументов
if (!inputPath) {
    console.error("Ошибка: не указан путь");
    process.exit(1);
}

if (!filterWords) {
    console.error("Ошибка: Укажи слова для фильтрации!");
    process.exit(1);
}

// Приводим путь к абсолютному
const musicPath = path.resolve(inputPath);

//считывание метаданных
async function mm(filePath) {
  try {
    const metadata = await parseFile(filePath);

console.log(`Title: ${metadata.common.title}, Artist: ${metadata.common.artist}`);  
} catch (error) {
    console.error('Error parsing metadata:', error.message);
  }
};



async function main() {
    try {
        const files = await fs.readdir(musicPath);

        // Фильтрация по имени файла
	const filteredFiles = files.filter(file => 
  filterWords.some(word => file.toLowerCase().includes(word.toLowerCase()))
); 


        console.log(`Всего файлов найдено: ${files.length}`);
        console.log(`Файлов, содержащих "${filterWords}": ${filteredFiles.length}`);
	

//filteredFiles.forEach((file) => {console.log(file); mm(path.join(musicPath, file))});



    } catch (error) {
        console.error(`Ошибка при чтении папки: ${error.message}`);
    }
}


main();
