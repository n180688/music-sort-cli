#!/usr/bin/env node


const fs = require('fs/promises');
const path = require('path');
const { parseFile } = require('music-metadata');
const pLimit = require('p-limit').default;
const cliProgress = require('cli-progress');



const limit = pLimit(5);//максимум 5 задач одновременно


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

// создаём прогресс-бар
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
bar.start(files.length, 0); // старт: всего файлов, начальное значение — 0


//получение метаданных из всех песен
const mdPromises = files.map(file =>
  limit(async () => {
    const metadata = await mm(path.join(musicPath, file));
    bar.increment(); // обновляем прогресс после каждого завершения
    return metadata;
  })
);

const allMetadata = await Promise.all(mdPromises);
bar.stop();

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
