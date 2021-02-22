var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var lib = require('./utils/glib');
var config = lib.getConfig();


///////////////////// start mongo /////////////////////////
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/gparts', {
        useCreateIndex: true,
        useNewUrlParser: true
    })
    .then(function(db) { // <- db as first argument
        console.log('Connected to gparts');
    })
    .catch(function(err) {
        console.log('error connecting to gparts');
        console.log('did you forget to start the mongo database server (mongod.exe)?');
        process.exit(0);

    });
var db = mongoose.connection;
db.on('open', function() {
    mongoose.connection.db.listCollections().toArray(function(err, names) {
        if (err) {
            console.log(err);
        } else {
            console.log(names);
        }
    });
});


// Routes
var routes = require('./routes/index');
var settings = require('./routes/settings');
var users = require('./routes/users');
var suppliers = require('./routes/suppliers');
var parts = require('./routes/parts');
var manufacturers = require('./routes/manufacturers');
var locations = require('./routes/locations');
var actions = require('./routes/actions');
var types = require('./routes/types');
var files = require('./routes/files');

// Init App
var app = express();


// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');

var hbs = exphbs.create({});
hbs.handlebars.registerHelper('ifCond', function(v1, v2, options) {
    if (v1 === v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
    customValidators: {
        isEqual: (value1, value2) => { return value1 === value2 }
    },
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// Connect Flash
app.use(flash());

// Global Vars


app.use(function(req, res, next) {

    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    if (res.locals.user && res.locals.user._doc.level > 0) {
        res.locals.power_user = req.user;
    }
    if (res.locals.user && res.locals.user._doc.level > 1) {
        res.locals.admin = req.user;
    }

    res.locals.modal_msg = req.flash('modal_msg');
    res.locals.modal_header_msg = req.flash('modal_header_msg');

    if (lib.getConfig().allowUserRegistration === true) {
        res.locals.allowUserRegistration = "checked";
    } else {
        res.locals.allowUserRegistration = "unchecked";
    }
    res.locals.fileSizeLimit = lib.getConfig().fileSizeLimit;
    res.locals.fileSizeLimitText = lib.bytesToUnitString(res.locals.fileSizeLimit, 2);
    res.locals.listDescriptionMaxLength = lib.getConfig().listDescriptionMaxLength;


    next();
});

app.use('/', routes);
app.use('/settings', settings);
app.use('/users', users);
app.use('/suppliers', suppliers);
app.use('/parts', parts);
app.use('/manufacturers', manufacturers);
app.use('/locations', locations);
app.use('/actions', actions);
app.use('/types', types);
app.use('/files', files);

lib.createFolderIfNotExists('files', function(err, path) {
    if (err) {
        console.log('Unable to create folder "' + path + '".');
        console.log(err);
        process.exit(1);;
    }
    console.log('created folder "' + path + '".');
});
lib.createFolderIfNotExists('files/images', function(err, path) {
    if (err) {
        console.log('Unable to create folder "' + path + '".');
        console.log(err);
        process.exit(1);;
    }
    console.log('created folder "' + path + '".');
});


// Set Port
app.set('port', config.port);

app.listen(app.get('port'), function() {
    console.log('Server started on port ' + app.get('port'));
});