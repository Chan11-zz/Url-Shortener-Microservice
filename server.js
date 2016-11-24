var express = require('express');
var app = express();
var db = require('./db.js');//imports module which handles database
var connectMongo = db.connectMongo(); //connects app to mongodb
var easyMongo = db.easyMongo;//main function/method which handles data base
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({
    extended: false
});
//template
var handlebars = require('express-handlebars')
    .create({
        defaultLayout: 'main'
    });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
//
var helpString = '12344567890qwertyuiopasdfghjkklzxcvbnm'; //to generate random path

app.set('port', process.env.PORT || 8080);

app.use(express.static('public'));

app.get('/404', function(req, res) {
    res.send('Bad request/Invalid Url or No Page exists');
});

app.use(function(req, res, next) {//middleware to check for shorturl if already exists in database

    if (req.path !== '/' && req.path !== '/shorturl') {
        
        easyMongo(db.findDoc, "urls", {
            "id": req.path.substring(1)
        }).then(function(result) {
            (result===null) ? res.redirect(301,'/404') :  res.redirect(301, result.url);//if shorturl found in db,redirects to
            //original url,if null returns to 404
        });
    }
    else {
        next();//if path='/' or '/shorturl'
    }
});

app.get('/', function(req, res) {
    res.render('home');//renders homepage
});

app.post('/shorturl', urlencodedParser, function(req, res) {
    var defaultUrl = req.body.url;
    var invalidObj = {
        "error": "Wrong url format, not a valid protocol."
    };

    if (validateUrl(defaultUrl)) {//if it is a valid url,generates object/JSON
        generateOBJ(defaultUrl, req, res);
    }
    else {
        res.render('url-page', {//if not a valid url, renders invalid object
            obj: JSON.stringify(invalidObj)
        });
    }
});

app.get('/shorturl', function(req, res) {
    res.redirect(301, '/');
});


process.on('exit', function() {
    db.closeMongo();
});

function validateUrl(defaultUrl) {//checks for valid url,source,credits:https://github.com/jzaefferer/jquery-validation/blob/master/src/core.js#L1349
    var reg = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
    return reg.test(defaultUrl);
}

function generateOBJ(defaultUrl, req, res) {//generates JSON
    var shortUrl;
    var str = null;
    easyMongo(db.findDoc, "urls", {//finds if short url already exists in db for requested original url
        "url": defaultUrl
    }).then(function(result) {
        if (result !== null && result.url === defaultUrl) {//if exists,copies its id
           // console.log("found default url in database", result);
            str = result.id;
        }
        else {
            str = randomPathGenerator();//if it does'nt exist,creates random id
            easyMongo(db.insertDoc, "urls", {//inserts id & original url
                "id": str,
                "url": defaultUrl
            });
        }
        shortUrl = `${req.protocol}://${req.get('host')}/${str}`;//creates short url by replacing original url with its id inserted in db

        var obj = {//creates JSON
            original: defaultUrl,
            short: shortUrl
        };
        res.render('url-page', {//renders JSON
            obj: JSON.stringify(obj),
            short: shortUrl
        });
    });
}

function randomPathGenerator() {//generates random string ,which is assigned to original url as its id
    var i = 0,
        str = '';
    while (i < 5) {
        str = str + helpString[Math.floor(Math.random() * 36)];
        i++;
    }
    return str;
}

app.listen(app.get('port'));
