const { getMetadata, normalizePath, getAllMetadataFromDir } = require("./utils.js");
const path = require('path');



async function findSongsWithoutMetadata(inputPath) {
  const allMetadata = await getAllMetadataFromDir(inputPath);

  const missingMetadata = allMetadata.filter(song => {
    return song.title === undefined || !song.artist === undefined;
  });

  console.log(`Песен без метаданных: ${missingMetadata.length}`);
  console.log(missingMetadata);

  return missingMetadata;
}



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

//получение метаданных из всех песен
const allMetadata = await getAllMetadataFromDir(inputPath);

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


module.exports = { filterMusic, findSongsWithoutMetadata };
