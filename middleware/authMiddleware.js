const jwt = require('jsonwebtoken');
const createError = require('http-errors');

const User = require('../models/userModel');

const checkUser = function (req, res, next) {
    const token = req.headers["authorization"];
    req.token = token;
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, function (err, decodedToken) {
            if (err) {
                // console.log("ERROR: " + err.message);
                return next(createError.Unauthorized("auth.invalidToken"));
            }
            User.findById(decodedToken._id, '-__v', function (err, user) {
                if (err) {
                    console.log("ERROR: " + err.message);
                    return next(createError.InternalServerError("auth.someError"));
                }

                if (!user)
                    return next(createError.Unauthorized("auth.login"));

                if (user.tokens.filter(e => e.token === token).length == 0)
                    return next(createError.Unauthorized("auth.loginAgain"));

                if (user.blocked == true)
                    return next(createError.Unauthorized("auth.blocked"));

                req.user = user;
                next();
            });
        });
    } else {
        next(createError.Unauthorized("auth.provideToken"));
    }
}

module.exports = checkUser;