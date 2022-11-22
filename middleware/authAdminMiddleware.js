const jwt = require('jsonwebtoken');

const Admin = require('../models/adminModel');

const checkAdmin = function (req, res, next) {
    const token = req.cookies['jwtAdmin'];
    req.session.checkAdminSuccess = true;
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, function (err, decodedToken) {
            if (err) {
                console.log("ERROR: " + err.message);
                req.admin = null;
                req.flash('red', 'Invalid token! Please login again.');
                return res.redirect('/admin/login');
            } else {
                Admin.findById(decodedToken._id, function (err, admin) {
                    if (err) {
                        console.log("ERROR: " + err.message);
                        req.admin = null;
                        req.flash('red', 'An error occured!');
                        return res.redirect('/admin/login');
                    }
                    if (!admin) {
                        req.flash('red', 'Please login as admin first!');
                        return res.redirect('/admin/login');
                    }
                    req.admin = admin;
                    req.session.checkAdminSuccess = undefined;
                    next();
                });
            }
        });
    } else {
        req.flash('red', 'Please login as admin first!');
        res.redirect('/admin/login');
    }
}

module.exports = checkAdmin;