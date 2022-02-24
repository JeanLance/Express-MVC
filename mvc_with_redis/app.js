/** === Dependencies === */
const express           = require("express");
const session           = require("express-session");
const redis             = require('redis');
const redisStore        = require('connect-redis')(session);
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

/** === Redis Section === */
const redisClient       = redis.createClient({legacyMode: true});
redisClient.connect();

redisClient.on('error', function (err) {
    console.log('Could not establish a connection with redis. ' + err);
});

redisClient.on('connect', function (err) {
    console.log('Connected to redis successfully');
});

config.session['store'] = new redisStore({ host: 'localhost', port: 6379, client: redisClient, ttl: 86400 })
/** === Redis Section === */

app.use(session(config.session));

app.set('views', path.join(__dirname, "./app/views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));                   // Parses HTTP POST request
app.use(router);                                                    // URL router

app.use(express.static( __dirname + "/assets" ));

/** Base url (from user config file) */
app.locals.base_url = config.base_url;

app.listen(8000, () => { console.log("listening on port 8000") });