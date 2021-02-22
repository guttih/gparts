var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
const helper = require('../utils/routeCollectionHelper');

module.exports.Utils = require('./modelUtility');

// 	Info on Schema types: http://mongoosejs.com/docs/schematypes.html
var UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    name: {
        type: String
    },
    backgroundColor: {
        type: String,
        default: '#ffffff'
    },
    fontColor: {
        type: String,
        default: '#333333'
    },
    menuBackgroundColor: {
        type: String,
        default: '#f7f7f7'
    },
    menuFontColor: {
        type: String,
        default: '#424242'
    },
    //level 0 = normal user
    //level 1 = power user
    //level 2 = admin (who can change user values such as change their user level)
    level: {
        type: Number
    }
});

var User = module.exports = mongoose.model('User', UserSchema);
module.exports.Utils = require('./modelUtility');

function _createUser(newUser, callback) {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}
module.exports.createUser = function(newUser, callback) {
    if (newUser._doc.level === 0) {
        User.find().countDocuments(function(err, count) {
            if (err || count === 0) {
                newUser._doc.level = 2; //the first user will become admin
            }
            _createUser(newUser, callback);
        });
    } else {
        _createUser(newUser, callback);
    }
};

module.exports.getUserByUsername = function(username, callback) {
    var query = { username: username };
    User.findOne(query, callback);
};

module.exports.getById = function(id, callback) {
    User.findById(id, callback);
};


module.exports.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        if (err) { throw err; }
        callback(null, isMatch);
    });
};

//get all users
module.exports.list = function(callback) {
    var query = {};
    User.find(query, callback);
};

module.exports.modify = function(id, newValues, callback) {
    if (newValues.password !== undefined) {
        //we need to encrypt the password
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(newValues.password, salt, function(err, hash) {
                newValues.password = hash;
                var val = { $set: newValues };
                User.update({ _id: id }, val, callback);
            });
        });
    } else {
        var val = { $set: newValues };
        User.update({ _id: id }, val, callback);
    }
};
module.exports.delete = function(id, callback) {

    User.findByIdAndRemove(id, callback);
};

module.exports.toJson = function(item, includePassword) {

    var ret = {
        id: item.id,
        username: item.username,
        email: item.email,
        name: item.name,
        backgroundColor: item.backgroundColor,
        fontColor: item.fontColor,
        menuBackgroundColor: item.menuBackgroundColor,
        menuFontColor: item.menuFontColor,
        level: item.level
    };
    if (includePassword && includePassword === true)
        ret.password = item.password;

    return ret;
};

module.exports.toJsonList = function(item) {
    return {
        id: item.id,
        username: item.username,
        email: item.email,
        name: item.name,
        level: item.level
    };
}

module.exports.search = function(query, sort, itemsPerPage, page) {
    return helper.collectionSearch('user', query, sort, itemsPerPage, page);
};

module.exports.getByIdAsJson = async function(id) {
    return await helper.collectionGetByIdAsJson('user', id, false);

}