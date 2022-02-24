/** === Dependencies === */
const express           = require("express");
const session           = require("express-session");
const path              = require('path');
const bodyParser        = require("body-parser");
const router            = require("./system/routes/routes");
const fs                = require("fs");
const yaml              = require('js-yaml');
const favicon           = require('serve-favicon');
/** ==================== */

const configDir         = path.join(__dirname, 'app/configs/config.yaml');
const config            = yaml.load(fs.readFileSync(configDir, 'utf8'));

const app               = express();

app.use(favicon(path.join(__dirname, 'assets', 'favicon.ico')));

app.use(session(config.session));

app.set('views', path.join(__dirname, "./app/views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));                   // Parses HTTP POST request
app.use(router);                                                    // URL router

app.use(express.static( __dirname + "/assets" ));

/** Base url (from user config file) */
app.locals.base_url = config.base_url;

app.listen(8000, () => { console.log("listening on port 8000") });