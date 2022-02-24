const base = require('..');
const appModelsDir = "../../app/models/";
const normalizedPath = base.path.join(__dirname, appModelsDir);

base.fs.readdirSync(normalizedPath).forEach(function(file) {
    let fileName = file.split(".").shift();
    let modelModule = require(appModelsDir + file);
    exports[fileName] = new modelModule();
});