const router = require('express').Router();
const { check, validationResult } = require('express-validator');
const S3 = require('../../helpers/s3');

const checkAdmin = require('../../middleware/authAdminMiddleware');

const multer = require('multer');
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10
    },
    fileFilter: fileFilter
});

// GET model
const Package = require('../../models/packageModel');
const Order = require('../../models/orderModel')

// GET package
router.get("/", checkAdmin, async (req, res) => {
    try {
        const packages = await Package.find();
        res.status(201).render("package", {
            packages,
            image: req.admin.image
        });
    } catch (error) {
        res.status(500).send("An error occured")
    }
});

// GET add package
router.get("/add", checkAdmin, (req, res) => {
    res.render("add_package", { image: req.admin.image });
});

// POST add package
router.post('/add', checkAdmin, upload.single('image'), [
    check('EnTitle', 'English title must have a value').notEmpty(),
    check('EnDesc', 'English description must have a value').notEmpty(),
    check('FrTitle', 'French title must have a value').notEmpty(),
    check('FrDesc', 'French description must have a value').notEmpty(),
    check('price', 'price must have a value').isNumeric(),
    check('annualReturn', 'annul return must have a value').isNumeric(),
    check('term', 'term must have a value').isNumeric(),
], async (req, res) => {
    try {
        const validationErrors = validationResult(req);
        if (validationErrors.errors.length > 0) {
            req.flash('red', validationErrors.errors[0].msg);
            return res.redirect(req.originalUrl);
        }

        let image;
        if (typeof req.file !== 'undefined') {
            const result = await S3.uploadFile(req.file);
            image = result.Location;
        }

        const monthlyReturn = req.body.monthlyReturn || (req.body.annualReturn / 12).toFixed(2);
        const dailyReturn = req.body.dailyReturn || (req.body.annualReturn / 365).toFixed(4);

        await Package.create({
            en: {
                title: req.body.EnTitle,
                description: req.body.EnDesc,
            },
            fr: {
                title: req.body.FrTitle,
                description: req.body.FrDesc,
            },
            price: req.body.price,
            annualReturn: req.body.annualReturn,
            dailyReturn,
            monthlyReturn,
            term: req.body.term,
            image,
        });

        req.flash('green', `Package added successfully`);
        res.redirect('/admin/package');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/admin/package');
    }
});

// GET edit package
router.get("/edit/:id", checkAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const package = await Package.findById(id);
        if (package == null) {
            req.flash('red', `Package not found!`);
            return res.redirect('/admin/package');
        }
        res.status(201).render("edit_package", {
            package,
            image: req.admin.image
        });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', `Package not found!`);
            res.redirect('/admin/package');
        } else {
            res.send(error)
        }
    }
});

// POST Edit package
router.post('/edit/:id', checkAdmin, upload.single('image'), [
    check('EnTitle', 'English title must have a value').notEmpty(),
    check('EnDesc', 'English description must have a value').notEmpty(),
    check('FrTitle', 'French title must have a value').notEmpty(),
    check('FrDesc', 'French description must have a value').notEmpty(),
    check('price', 'price must have a value').isNumeric(),
    check('annualReturn', 'annul return must have a value').isNumeric(),
    check('term', 'term must have a value').isNumeric(),
], async (req, res) => {
    try {
        const validationErrors = validationResult(req);
        if (validationErrors.errors.length > 0) {
            req.flash('red', validationErrors.errors[0].msg);
            return res.redirect(req.originalUrl);
        }

        const id = req.params.id;
        const monthlyReturn = req.body.monthlyReturn || (req.body.annualReturn / 12).toFixed(2);
        const dailyReturn = req.body.dailyReturn || (req.body.annualReturn / 365).toFixed(4);
        const package = await Package.findById(id);
        if (package == null) {
            req.flash('red', `Package not found!`);
            return res.redirect('/admin/package');
        }

        package.en.title = req.body.EnTitle;
        package.en.description = req.body.EnDesc;
        package.fr.title = req.body.FrTitle;
        package.fr.description = req.body.FrDesc;
        package.price = req.body.price;
        package.annualReturn = req.body.annualReturn;
        package.monthlyReturn = monthlyReturn;
        package.dailyReturn = dailyReturn;
        package.term = req.body.term;

        if (typeof req.file !== 'undefined') {
            const result = await S3.uploadFile(req.file);
            package.image = result.Location;
        }

        await package.save();

        req.flash('green', `Package edited successfully`);
        res.redirect('/admin/package');
    } catch (error) {
        console.log(error.message);
        if (error.name === 'CastError') {
            req.flash('red', `Package not found!`);
            res.redirect('/admin/package');
        } else {
            res.send(error.message);
        }
    }
});

// GET package by id
router.get('/:id', checkAdmin, async (req, res) => {
    try {
        const [package, orders] = await Promise.all([
            Package.findById(req.params.id),
            Order.find({ package: req.params.id })
                .populate('project package user')
                .sort('-_id')
        ])

        if (package == null) {
            req.flash('red', 'Package not found!');
            return res.redirect('/admin/package');
        }

        res.render('package_view', {
            package,
            orders,
            image: req.admin.image
        })
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', `Package not found!`);
        } else {
            req.flash('red', error.message);
        }
        res.redirect('/admin/package');
    }
})

module.exports = router;