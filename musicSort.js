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
return {
	title: metadata.common.title,
	artist: metadata.common.artist,
	path: filePath,
	}

} catch (error) {
   	return{
		path: filePath,
		error: error.message,
	}

  }
};




async function main() {
    try {
	
        const files = await fs.readdir(musicPath);


        console.log(`Всего файлов найдено: ${files.length}`);

//получение метаданных из всех песен
const mdPromises = files.map(file => mm(path.join(musicPath, file)));

const allMetadata = await Promise.all(mdPromises);

//фильтрация
const filteredSongs = allMetadata.filter(file => {
	const lowerTitle = file.title?.toLowerCase() || '';
	const lowerArtist = file.artist?.toLowerCase() || '';
	const lowerFilename = path.basename(file.path).toLowerCase();

	const hasWordInTitle = filterWords.some(word => lowerTitle.includes(word.toLowerCase()));
	const hasWordInArtist = filterWords.some(word => lowerArtist.includes(word.toLowerCase()));
	const hasWordInFilename = filterWords.some(word => lowerFilename.includes(word.toLowerCase()));

return hasWordInTitle || hasWordInArtist || hasWordInFilename;

});

console.log(`Файлов, содержащих "${filterWords}": ${filteredSongs.length}`);
console.log(filteredSongs);


    } catch (error) {
        console.error(`Ошибка при чтении папки: ${error.message}`);
  }
}


main();
