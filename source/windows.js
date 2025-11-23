import {promisify} from 'node:util';
import childProcess from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execFile = promisify(childProcess.execFile);

// Binary source → https://github.com/sindresorhus/windows-wallpaper
const binary = path.join(__dirname, 'windows-wallpaper-x86-64.exe');

export async function getWallpaper() {
	const arguments_ = [
		'get',
	];

	const {stdout} = await execFile(binary, arguments_);
	return stdout.trim();
}

export async function setWallpaper(imagePath, {scale = 'fill', screen = 'main'} = {}) {
	if (typeof imagePath !== 'string') {
		throw new TypeError('Expected a string');
	}

	const arguments_ = [
		'set',
		path.resolve(imagePath),
		'--scale',
		scale,
	];

	if (screen === 'all') {
		let screen = 0;
		while (true) { // eslint-disable-line no-constant-condition
			try {
				await execFile(binary, [...arguments_, // eslint-disable-line no-await-in-loop
					'--screen',
					`${screen}`]);
				screen++;
			} catch (error) {
				if (error.stderr.startsWith('The available monitors are from')) {
					break;
				} else {
					throw error;
				}
			}
		}
	} else if (Number.parseInt(screen, 10) >= 0) {
		await execFile(binary, [...arguments_,
			'--screen',
			`${screen}`]);
	} else {
		await execFile(binary, arguments_);
	}
}
