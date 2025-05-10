const { exec } = require('child_process');
const path = require('path');
const { moveFile } = require('./mvFile.js');


function findMusicFiles( searchPath = `${process.env.HOME}/storage/shared/`, excludeDir = 'Music/Музыка/') {
  return new Promise((resolve) => {
    const formats = ['mp3', 'flac', 'm4a', 'ogg', 'opus', 'aac'];
    const findConditions = formats.map(ext => `-iname "*.${ext}"`).join(' -o ');

const resolvedExclude = `${path.resolve(searchPath, excludeDir)}`;

    const command = `find "${searchPath}" -path "${resolvedExclude}" -prune -o -type f \\( ${findConditions} \\) `;

    exec(command, (error, stdout, stderr) => {
      if (stderr) {
        console.warn('Предупреждение от find:', stderr);
      }

      // Разбираем stdout
      const files = stdout
        .split('\n')
	.map(f => f.trim())
  .filter(f => f && path.extname(f)); //отфильтровывает директории
      resolve(files);
    });
  });
}




(async () => {
  const files = await findMusicFiles();
  console.log('Найденные треки:', files);

  for (const file of files) {
    if (!file.trim()) continue;
    await moveFile(file, `${process.env.HOME}/storage/shared/Music/Музыка`);
  }
})();
