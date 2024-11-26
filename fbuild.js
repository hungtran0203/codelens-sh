const fs = require('fs');
const path = require('path');

function findFjsFiles(directory, prefix) {
		if (!fs.existsSync(directory)) {
			return [];
		}
    const files = fs.readdirSync(directory);
    const fjsFiles = files.filter(file => {
			const basename = path.basename(file, '.fjs');
			return path.extname(file) === '.fjs' && (!prefix || basename.startsWith(prefix));
	});

	const rtn = [];
	for (const file of fjsFiles) {
			const filePath = path.resolve(directory, file);
			rtn.push(filePath);
	}
	return rtn;
}

(async () => {
	const files = [
		...findFjsFiles('.', 'rules'),
		...findFjsFiles('fjs', 'rules')
	];

	const bundle = {};
	for (const file of files) {
		const mod = require(file);
		Object.keys(mod).forEach(key => {
			const fn = mod[key];
			const fnStr = fn.toString();
			// validate function str
			new Function("return " + fnStr)();
			bundle[key] = fnStr;
		});
	}
})();

console.log('test');