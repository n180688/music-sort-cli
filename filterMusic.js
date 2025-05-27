const { getMetadata, normalizePath } = require("./utils.js");
const path = require('path');
const fs = require('fs/promises');
const pLimit = require('p-limit').default;
const cliProgress = require('cli-progress');


const limit = pLimit(5);



async function filterMusic(inputPath, filterWords) {
//проверка аргументов
if (!inputPath) {
    console.error("Ошибка: не указан путь");
    process.exit(1);
}

if (!filterWords) {
    console.error("Ошибка: Укажи слова для фильтрации!");
    process.exit(1);
} 
   
//поиск от домашней папки, для термукса
inputPath  = normalizePath(inputPath);

    try {

        const files = await fs.readdir(inputPath);
        console.log(`Всего файлов найдено: ${files.length}`);

// создаём прогресс-бар
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
bar.start(files.length, 0); // старт: всего файлов, начальное значение — 0


//получение метаданных из всех песен
const mdPromises = files.map(file =>
  limit(async () => {
    const metadata = await getMetadata(path.join(inputPath, file));
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
return filteredSongs;

    } catch (error) {
        console.error(`Ошибка при чтении папки: ${error.message}`);
  }
}


module.exports = { filterMusic };
