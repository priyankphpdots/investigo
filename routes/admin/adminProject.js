const router = require('express').Router();
const mongoose = require('mongoose');
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
        // req._params = req.params;
        // cb(new Error('Wrong file type! (Please upload only jpg or png.)'));
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
const Project = require('../../models/projectModel');
const Order = require('../../models/orderModel');

// GET project
router.get("/", checkAdmin, async (req, res) => {
    try {
        const projects = await Project.find({ finished: false }).sort('-_id');
        res.status(201).render("project", {
            projects,
            image: req.admin.image
        });
    } catch (error) {
        res.status(500).send("An error occured");
    }
});

// GET add project
router.get("/add", checkAdmin, (req, res) => {
    res.render("add_project", { image: req.admin.image });
});

// POST add project
router.post('/add', checkAdmin, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'icon', maxCount: 1 },
    { name: 'gallery' }
]), [
    check('EnTitle', 'English title must have a value').notEmpty(),
    check('EnDesc', 'English description must have a value').notEmpty(),
    check('EnReasons', 'English reasons must have a value').notEmpty(),
    check('FrTitle', 'French title must have a value').notEmpty(),
    check('FrDesc', 'French description must have a value').notEmpty(),
    check('FrReasons', 'French reasons must have a value').notEmpty(),
    check('category', 'category must have a value').notEmpty(),
    check('property', 'property must have a value').notEmpty(),
    check('totalAmount', 'total amount must have a value').isNumeric(),
    check('monthlyReturn', 'monthly return must have a value').notEmpty(),
    check('location', 'location must have a value').notEmpty(),
], async (req, res) => {
    try {
        const validationErrors = validationResult(req);
        if (validationErrors.errors.length > 0) {
            req.flash('red', validationErrors.errors[0].msg);
            return res.redirect(req.originalUrl);
        }
        if (req.body.totalAmount < 100000) {
            req.flash('red', 'Total amount can not be less than 100000.');
            return res.redirect(req.originalUrl);
        }

        // image
        let image;
        if (typeof req.files.image[0] !== 'undefined') {
            const result = await S3.uploadFile(req.files.image[0]);
            image = result.Location;
        }

        // icon
        let icon;
        if (typeof req.files.icon[0] !== 'undefined') {
            const result = await S3.uploadFile(req.files.icon[0]);
            icon = result.Location;
        }

        // gallery
        let gallery = [];
        if (req.files.gallery) {
            for (let i = 0; i < req.files.gallery.length; i++) {
                if (typeof req.files.gallery[i] !== 'undefined') {
                    const result = await S3.uploadFile(req.files.gallery[i]);
                    let name = result.Location;
                    gallery.push(name);
                }
            }
        }

        await Project.create({
            en: {
                title: req.body.EnTitle,
                description: req.body.EnDesc,
                reasons: req.body.EnReasons,
            },
            fr: {
                title: req.body.FrTitle,
                description: req.body.FrDesc,
                reasons: req.body.FrReasons,
            },
            category: req.body.category,
            property: req.body.property,
            totalAmount: req.body.totalAmount,
            monthlyReturn: req.body.monthlyReturn,
            location: req.body.location.replace(/\s*,\s*/g, ",").trim(),
            url: req.body.url,
            image,
            icon,
            gallery,
        });

        req.flash('green', `Project added successfully`);
        res.redirect('/admin/project');
    } catch (error) {
        res.send(error.message);
    }
});

// GET edit project
router.get("/edit/:id", checkAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const project = await Project.findById(id);
        if (project == null) {
            req.flash('red', `Project not found!`);
            return res.redirect('/admin/project');
        }
        res.status(201).render("edit_project", {
            project,
            image: req.admin.image
        });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', `Project not found!`);
            res.redirect('/admin/project');
        } else {
            res.send(error)
        }
    }
});

// POST Edit project
router.post('/edit/:id', checkAdmin, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'icon', maxCount: 1 }
]), [
    check('EnTitle', 'English title must have a value').notEmpty(),
    check('EnDesc', 'English description must have a value').notEmpty(),
    check('EnReasons', 'English reasons must have a value').notEmpty(),
    check('FrTitle', 'French title must have a value').notEmpty(),
    check('FrDesc', 'French description must have a value').notEmpty(),
    check('FrReasons', 'French reasons must have a value').notEmpty(),
    check('category', 'category must have a value').notEmpty(),
    check('property', 'property must have a value').notEmpty(),
    check('totalAmount', 'total amount must have a value').isNumeric(),
    check('monthlyReturn', 'monthly return must have a value').notEmpty(),
    check('location', 'location must have a value').notEmpty(),
], async (req, res) => {
    try {
        const validationErrors = validationResult(req);
        if (validationErrors.errors.length > 0) {
            req.flash('red', validationErrors.errors[0].msg);
            return res.redirect(req.originalUrl);
        }

        const id = req.params.id;
        const project = await Project.findById(id);
        if (project == null) {
            req.flash('red', `Project not found!`);
            return res.redirect('/admin/project');
        }
        if (req.body.totalAmount < project.invested) {
            req.flash('red', 'Total amount can not be less than already invested amount.');
            return res.redirect(req.originalUrl);
        }

        project.en.title = req.body.EnTitle;
        project.en.description = req.body.EnDesc;
        project.en.reasons = req.body.EnReasons;
        project.fr.title = req.body.FrTitle;
        project.fr.description = req.body.FrDesc;
        project.fr.reasons = req.body.FrReasons;
        project.category = req.body.category;
        project.property = req.body.property;
        project.totalAmount = req.body.totalAmount;
        project.monthlyReturn = req.body.monthlyReturn;
        project.location = req.body.location.replace(/\s*,\s*/g, ",").trim();
        project.url = req.body.url;

        if (typeof req.files.image !== 'undefined') {
            const result = await S3.uploadFile(req.files.image[0]);
            project.image = result.Location;
        }

        if (typeof req.files.icon !== 'undefined') {
            const result = await S3.uploadFile(req.files.icon[0]);
            project.icon = result.Location;
        }

        await project.save();

        req.flash('green', `Project edited successfully`);
        res.redirect('/admin/project');
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', `Project not found!`);
            res.redirect('/admin/project');
        } else {
            req.flash('red', error.message);
            res.redirect('/admin/project');
        }
    }
});

// add image
router.post('/gallery/:id/add', upload.single('image'), async (req, res) => {
    const id = req.params.id;
    try {
        // upload file
        let url;
        if (typeof req.file !== 'undefined') {
            const result = await S3.uploadFile(req.file);
            url = result.Location;
        }

        // update project
        await Project.findByIdAndUpdate(
            id,
            { $push: { gallery: url } }
        );

        res.redirect(`/admin/project/gallery/${id}`);
    } catch (error) {
        req.flash('red', error.message);
        res.redirect(`/admin/project/gallery/${id}`);
    }
});

// edit image
router.post('/gallery/:id/edit/:i', upload.single('image'), async (req, res) => {
    const { id, i } = req.params;
    try {
        const project = await Project.findById(id);
        const gallery = project.gallery;

        // upload file
        let url;
        if (typeof req.file !== 'undefined') {
            const result = await S3.uploadFile(req.file);
            url = result.Location;
        }

        // update project
        gallery[i] = url;
        await project.save();

        res.redirect(`/admin/project/gallery/${id}`);
    } catch (error) {
        req.flash('red', error.message);
        res.redirect(`/admin/project/gallery/${id}`);
    }
});

// delete image
router.get('/gallery/:id/delete/:i', async (req, res) => {
    const { id, i } = req.params;
    try {
        const project = await Project.findById(id);

        // update project
        project.gallery = project.gallery.filter(e => e !== project.gallery[i]);
        await project.save();

        res.redirect(`/admin/project/gallery/${id}`);
    } catch (error) {
        req.flash('red', error.message);
        res.redirect(`/admin/project/gallery/${id}`);
    }
});

// GET project gallery
router.get('/gallery/:id', checkAdmin, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (project == null) {
            req.flash('red', 'Project not found!');
            return res.redirect('/admin/project');
        }

        res.render('project_gallery', {
            project,
            image: req.admin.image
        });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', `Project not found!`);
        } else {
            req.flash('red', error.message);
        }
        res.redirect('/admin/project');
    }
});

// GET project by id
router.get('/:id', checkAdmin, async (req, res) => {
    try {
        const [project, orders, docs] = await Promise.all([
            Project.findById(req.params.id),
            Order.find({ project: req.params.id })
                .populate('project package user')
                .sort('-_id'),
            Order.aggregate([
                { $match: { project: mongoose.Types.ObjectId(req.params.id) } },
                {
                    $group: {
                        _id: '$package',
                        numberOfOrders: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } },
                { $lookup: { from: 'packages', localField: '_id', foreignField: '_id', as: 'package' } }
            ]),
        ]);

        if (project == null) {
            req.flash('red', 'Project not found!');
            return res.redirect('/admin/project');
        }

        res.render('project_view', {
            project,
            orders,
            docs,
            image: req.admin.image
        });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', `Project not found!`);
        } else {
            req.flash('red', error.message);
        }
        res.redirect('/admin/project');
    }
});

module.exports = router;