const router = require('express').Router();
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
const customId = require("custom-id");
const { authenticator } = require('otplib') // generate totp
const QRCode = require('qrcode') // change url to qr
const { sendOtp } = require('../../helpers/sendEmail');
const multilingualUser = require('../../helpers/multilingual_user');

const checkUser = require('../../middleware/authMiddleware');

const User = require('../../models/userModel');
const Otp = require('../../models/otpModel');

const generateCode = length => {
    var digits = '0123456789';
    let generated = '';
    for (let i = 0; i < length; i++) {
        generated += digits[Math.floor(Math.random() * 10)];
    }
    return generated;
}

// POST register
router.post("/register", async (req, res, next) => {
    try {
        const userExist = await User.findOne({ email: req.body.email });
        if (userExist) {
            if (userExist.googleId) {
                return next(createError.BadRequest('error.emailRegG'));
            }
            if (userExist.facebookId) {
                return next(createError.BadRequest('error.emailRegF'));
            }
            return next(createError.BadRequest('error.emailReg'));
        }
        if (
            req.body.youAre == 'retailer' &&
            (req.body.tvaNumber || req.body.enterprise)
        )
            return next(createError.BadRequest('Invalid input.'));
        if (req.body.youAre == 'business' && !req.body.tvaNumber)
            return next(createError.BadRequest('Please provide TVA number.'));
        if (req.body.youAre == 'business' && !req.body.enterprise)
            return next(createError.BadRequest('Please provide name of enterprise.'));

        const id = customId({});
        let user = new User({
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            password: req.body.password,
            userId: id,
            youAre: req.body.youAre,
            tvaNumber: req.body.tvaNumber,
            enterprise: req.body.enterprise,
        });
        const token = await user.generateAuthToken(req.body.device);
        user = multilingualUser(user, req);
        res.status(200).json({ status: "success", token, user });
    } catch (error) {
        console.log(error);
        if (error.keyValue && error.keyValue.userId) {
            return next(createError.InternalServerError('error.server'));
        }
        next(error);
    }
})

// POST login
router.post("/login", async (req, res, next) => {
    try {
        const { email, password, googleId, facebookId, device } = req.body;
        let userExist = await User.findOne({ email }).select('-__v -blocked -secret');

        if (password) { // password
            if (!userExist) {
                return next(createError.BadRequest('error.invalidCred'));
            }
            if (!userExist.password) {
                if (userExist.googleId) {
                    return next(createError.BadRequest('error.loginGoogle'));
                }
                if (userExist.facebookId) {
                    return next(createError.BadRequest('error.loginFacebook'));
                }
            }
            const isMatch = await bcrypt.compare(password, userExist.password);
            if (!isMatch) {
                return next(createError.BadRequest('error.invalidCred'));
            }
            if (userExist.twofa) {
                return res.status(200).json({ status: "success", message: req.t("2fa.required") });
            }
            const token = await userExist.generateAuthToken(device);
            userExist = multilingualUser(userExist, req);
            return res.status(200).json({ status: "success", token, user: userExist });
        } else if (googleId) { // google
            if (userExist) {
                if (!userExist.googleId) {
                    if (userExist.facebookId) {
                        return next(createError.BadRequest('error.loginFacebook'));
                    }
                    if (userExist.password) {
                        return next(createError.BadRequest('error.loginCred'));
                    }
                }
                if (userExist.googleId != googleId) {
                    return next(createError.BadRequest(`Invalid google id.`));
                }
                if (userExist.twofa) {
                    return res.status(200).json({ status: "success", message: req.t("2fa.required") });
                }
                const token = await userExist.generateAuthToken(device);
                userExist = multilingualUser(userExist, req);
                return res.status(200).json({ status: "success", token, user: userExist });
            } else {
                if (
                    req.body.youAre == 'retail' &&
                    (req.body.tvaNumber || req.body.enterprise)
                )
                    return next(createError.BadRequest('Invalid input.'));
                if (req.body.youAre == 'business' && !req.body.tvaNumber)
                    return next(createError.BadRequest('Please provide TVA number.'));
                if (req.body.youAre == 'business' && !req.body.enterprise)
                    return next(createError.BadRequest('Please provide name of enterprise.'));

                const id = customId({});
                let user = new User({
                    fname: req.body.fname,
                    lname: req.body.lname,
                    email: req.body.email,
                    youAre: req.body.youAre,
                    tvaNumber: req.body.tvaNumber,
                    enterprise: req.body.enterprise,
                    userId: id,
                    googleId,
                });
                const token = await user.generateAuthToken(device);
                user = multilingualUser(user, req);
                return res.status(200).json({ status: "success", token, user });
            }
        } else if (facebookId) { // facebook
            if (userExist) {
                if (!userExist.facebookId) {
                    if (userExist.googleId) {
                        return next(createError.BadRequest('error.loginGoogle'));
                    }
                    if (userExist.password) {
                        return next(createError.BadRequest('error.loginCred'));
                    }
                }
                if (userExist.facebookId != facebookId) {
                    return next(createError.BadRequest(`Invalid facebook id.`));
                }
                if (userExist.twofa) {
                    return res.status(200).json({ status: "success", message: req.t("2fa.required") });
                }
                const token = await userExist.generateAuthToken(device);
                userExist = multilingualUser(userExist, req);
                return res.status(200).json({ status: "success", token, user: userExist });
            } else {
                if (
                    req.body.youAre == 'retailer' &&
                    (req.body.tvaNumber || req.body.enterprise)
                )
                    return next(createError.BadRequest('Invalid input.'));
                if (req.body.youAre == 'business' && !req.body.tvaNumber)
                    return next(createError.BadRequest('Please provide TVA number.'));
                if (req.body.youAre == 'business' && !req.body.enterprise)
                    return next(createError.BadRequest('Please provide name of enterprise.'));

                const id = customId({});
                let user = new User({
                    fname: req.body.fname,
                    lname: req.body.lname,
                    email: req.body.email,
                    youAre: req.body.youAre,
                    tvaNumber: req.body.tvaNumber,
                    enterprise: req.body.enterprise,
                    userId: id,
                    facebookId
                });
                const token = await user.generateAuthToken(device);
                user = multilingualUser(user, req);
                return res.status(200).json({ status: "success", token, user });
            }
        } else {
            return next(createError.BadRequest(`Please provide password, googleId or facebookId.`));
        }
    } catch (error) {
        if (error.keyValue && error.keyValue.userId) {
            return next(createError.InternalServerError('error.server'));
        }
        next(error);
    }
});

// POST login 2fa
router.post("/two-factor-login", async (req, res, next) => {
    try {
        const { email, code, device } = req.body;
        let user = await User.findOne({ email }).select('-__v -blocked -password');

        if (!user)
            return next(createError.BadRequest("Email not registered."));
        if (!user.secret)
            return next(createError.BadRequest("2fa.notEnabled"));

        const verify = await user.verifyCode(code);
        if (!verify)
            return next(createError.BadRequest("2fa.failCode"));

        const token = await user.generateAuthToken(device);
        user = multilingualUser(user, req);
        // hide secret
        user.secret = undefined;
        return res.status(200).json({ status: "success", token, user });
    } catch (error) {
        next(error);
    }
});

// POST logout
router.get("/logout", checkUser, async (req, res, next) => {
    try {
        // remove this token
        req.user.tokens = req.user.tokens.filter(e => {
            return e.token !== req.token;
        });
        await req.user.save();

        return res.status(200).json({
            status: "success",
            message: req.t("auth.logout")
        });
    } catch (error) {
        next(error);
    }
});

// POST logoutAll
router.get("/logoutall", checkUser, async (req, res, next) => {
    try {
        // remove all tokens
        req.user.tokens = [];
        await req.user.save();

        return res.status(200).json({
            status: "success",
            message: req.t("auth.logoutAll")
        });
    } catch (error) {
        next(error);
    }
});

// logout by id
router.get("/logout/:id", checkUser, async (req, res, next) => {
    try {
        // remove token with given id
        req.user.tokens = req.user.tokens.filter(e => {
            return e.id !== req.params.id;
        });
        await req.user.save();

        req.user = multilingualUser(req.user, req);

        return res.status(200).json({
            status: "success",
            message: req.t("auth.logout"),
            token: req.token,
            user: req.user,
        });
    } catch (error) {
        next(error);
    }
});

// POST Change Pass
router.post("/changepass", checkUser, async (req, res, next) => {
    try {
        const user = req.user;
        if (!user.password) {
            if (user.googleId) {
                return next(createError.BadRequest('changePass.google'));
            }
            if (user.facebookId) {
                return next(createError.BadRequest('changePass.facebook'));
            }
        }
        const { currentpass, newpass, cfnewpass } = req.body;
        if (!currentpass || currentpass.length < 6) {
            return next(createError.BadRequest('changePass.pass'));
        }
        if (!newpass || newpass.length < 6) {
            return next(createError.BadRequest('changePass.newPass'));
        }
        if (!cfnewpass || cfnewpass.length < 6) {
            return next(createError.BadRequest('changePass.cfPass'));
        }
        const isMatch = await bcrypt.compare(currentpass, user.password);
        if (!isMatch) {
            return next(createError.BadRequest('changePass.wrongPass'));
        }
        if (currentpass == newpass) {
            return next(createError.BadRequest('changePass.samePass'));
        }
        if (newpass != cfnewpass) {
            return next(createError.BadRequest('changePass.notMatch'));
        }
        user.password = newpass;
        await user.save();
        return res.status(200).json({
            status: "success",
            message: req.t('changePass.updated')
        });
    } catch (error) {
        next(error);
    }
});

// POST forgot pass
router.post("/forgot", async (req, res, next) => {
    try {
        const email = req.body.email;
        const user = await User.findOne({ email });
        if (user == null) {
            return next(createError.BadRequest('notReg'));
        }

        let otp = await Otp.findOne({ userId: user._id });
        if (!otp) {
            const generated = generateCode(6);
            otp = await new Otp({
                userId: user.id,
                otp: generated
            }).save();
        }

        sendOtp(user.email, otp.otp);

        return res.status(200).json({
            status: "success",
            email: user.email,
            otp: otp.otp
        });
    } catch (error) {
        next(error);
    }
});

// POST reset password
router.post("/reset_pass", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user == null) {
            return next(createError.BadRequest('notReg'));
        }
        user.password = password;
        await user.save();
        return res.status(200).json({
            status: "success",
            message: req.t('passChanged')
        });
    } catch (error) {
        next(error);
    }
});

// create secret and return qrcode
router.get('/get-2fa-qr', checkUser, async (req, res, next) => {
    try {
        if (req.user.twofa)
            return next(createError.Conflict('2fa.already'));

        const email = req.user.email;

        let secret;
        if (req.user.secret) {
            secret = req.user.secret;
        } else {
            secret = authenticator.generateSecret();
            await User.findByIdAndUpdate(req.user.id, { secret });
        }

        // generate qr
        QRCode.toDataURL(authenticator.keyuri(email, 'Investigo', secret), (err, url) => {
            if (err) {
                console.log(err);
                return next(createError.InternalServerError());
            }

            res.json({ url });
        });
    } catch (error) {
        next(error);
    }
});

// enable 2fa
router.post('/enable-2fa', checkUser, async (req, res, next) => {
    try {
        let user = req.user;

        if (user.twofa)
            return next(createError.Conflict('2fa.already'));

        const verify = await user.verifyCode(req.body.code);

        if (!verify)
            return next(createError.Conflict('2fa.failCode'));

        // generate and store recovery code
        const recoveryCode = generateCode(8);
        user.recoveryCode = recoveryCode;

        user.twofa = true;
        await user.save();

        user = multilingualUser(user, req);

        // hide secret
        user.secret = undefined;

        return res.json({
            status: "Success",
            recoveryCode,
            message: req.t('2fa.enabled'),
            user,
        });
    } catch (error) {
        next(error);
    }
});

// disable 2fa
router.post("/disable-2fa", checkUser, async (req, res, next) => {
    try {
        let user = req.user;

        if (!user.twofa)
            return next(createError.Conflict('2fa.notEnabled'));

        const verify = await user.verifyCode(req.body.code);

        if (!verify)
            return next(createError.Conflict('2fa.failCode'));

        user.secret = undefined;
        user.recoveryCode = undefined;
        user.twofa = false;
        await user.save();
        user = multilingualUser(user, req);

        return res.json({
            status: "Success",
            message: req.t('2fa.disabled'),
            user,
        });
    } catch (error) {
        next(error);
    }
});

// GET recover account
router.post('/recover', async (req, res, next) => {
    try {
        const email = req.body.email;
        const user = await User.findOne({ email });
        if (!user)
            return next(createError.BadRequest('notReg'));

        const secret = user.secret;
        if (!secret) {
            console.log(`user.secret is ${user.secret}!`);
            return next(createError.BadRequest('2fa.notEnabled'));
        }

        // check recovery code
        if (req.body.recoveryCode != user.recoveryCode)
            return next(createError.BadRequest('2fa.wrongRecovery'));

        // generate qr
        QRCode.toDataURL(authenticator.keyuri(email, 'Investigo', secret), (err, url) => {
            if (err) {
                console.log(err);
                return next(createError.InternalServerError());
            }

            res.json({ url });
        })
    } catch (error) {
        next(error);
    }
});

module.exports = router;