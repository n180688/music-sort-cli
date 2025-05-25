const { exec } = require('child_process');
const path = require('path');
const fs = require('fs/promises');
const { askName, copySong, copyFilteredSongs, createPlaylist, getMetadata } = require("./utils.js");


function findMusicFiles( searchPath, excludeDir) {
  return new Promise((resolve) => {
    const formats = ['mp3', 'flac', 'm4a', 'ogg', 'opus', 'aac'];
    const findConditions = formats.map(ext => `-iname "*.${ext}"`).join(' -o ');
    const command = `find "${searchPath}" -path "${excludeDir}" -prune -o -type f \\( ${findConditions} \\) `;
    exec(command, (error, stdout, stderr) => {
	if (stderr) {
        console.warn('Предупреждение от find:', stderr);
		}
      // Разбираем stdout
      const files = stdout.split('\n').map(f => f.trim())
  	.filter(f => f && path.extname(f)); //отфильтровывает директории
      resolve(files);
    });
  });
}




async function collectMusic(searchPath, excludeDir,  destDir) {
//поиск от домашней папки, для термукса
searchPath  = `${path.resolve(process.env.HOME, searchPath)}/`;
excludeDir = `${path.resolve(searchPath, excludeDir)}`;
//папка назначения по умолчанию та  что исключена
destDir = `${path.resolve(searchPath, excludeDir)}`;


  const files = await findMusicFiles(searchPath, excludeDir);
  console.log('Найденные треки:', files);

  for (const file of files) {
    if (!file.trim()) continue;
    await copySong(file, destDir);

await fs.unlink(file);
  console.log(`${file} удален`);
  }
}



module.exports = { collectMusic };
