const router = require('express').Router();
const { check, validationResult } = require('express-validator');

const checkAdmin = require('../../middleware/authAdminMiddleware');
const Update = require('../../models/updateModel');
const Project = require('../../models/projectModel');

// GET all project updates
router.get('/project', checkAdmin, async (req, res) => {
    try {
        const updates = await Update.find({ forBenefits: false })
            .sort('-_id')
            .populate('project', 'en.title');

        res.status(201).render('updates', {
            updates,
            image: req.admin.image,
        });
    } catch (error) {
        res.status(500).send('An error occured');
    }
});

// GET add project update
router.get('/project/add', checkAdmin, async (req, res) => {
    try {
        const projects = await Project.find({ finished: false })
            .select('en.title');
        res.render('add_update', {
            projects,
            image: req.admin.image,
        });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/admin/update/project');
    }
});

// POST add project update
router.post('/project/add', checkAdmin, [
    check('EnName', 'Name must have a value').notEmpty(),
    check('FrName', 'Name must have a value').notEmpty(),
], async (req, res) => {
    try {
        const validationErrors = validationResult(req);
        if (validationErrors.errors.length > 0) {
            req.flash('red', validationErrors.errors[0].msg);
            return res.redirect(req.originalUrl);
        }

        await Update.create({
            en: {
                name: req.body.EnName,
            },
            fr: {
                name: req.body.FrName,
            },
            project: req.body.project,
            date: req.body.date ? req.body.date : undefined,
        });

        req.flash('green', 'Update added successfully.');
        res.redirect('/admin/update/project');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/admin/update/project');
    }
});

// GET edit project update
router.get("/project/edit/:id", checkAdmin, async (req, res) => {
    try {
        const [update, projects] = await Promise.all([
            Update.findById(req.params.id).populate('project', 'en.title'),
            Project.find({ finished: false }).select('en.title'),
        ]);

        if (update == null) {
            req.flash('red', 'Update not found!');
            return res.redirect('/admin/update/project');
        }

        res.status(201).render("edit_update", {
            update,
            projects,
            date: update.date.toISOString().split('T')[0],
            image: req.admin.image
        });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', 'Update not found!');
            return res.redirect('/admin/update/project');
        } else {
            req.flash('red', error.message);
            return res.redirect('/admin/update/project');
        }
    }
});

// POST edit project update
router.post("/project/edit/:id", checkAdmin, [
    check('EnName', 'Name must have a value').notEmpty(),
    check('FrName', 'Name must have a value').notEmpty(),
], async (req, res) => {
    try {
        const validationErrors = validationResult(req);
        if (validationErrors.errors.length > 0) {
            req.flash('red', validationErrors.errors[0].msg);
            return res.redirect(req.originalUrl);
        }

        const update = await Update.findById(req.params.id).populate('project', 'en.title');

        if (update == null) {
            req.flash('red', 'Update not found!');
            return res.redirect('/admin/update/project');
        }

        update.en.name = req.body.EnName;
        update.fr.name = req.body.FrName;
        update.project = req.body.project;
        update.date = req.body.date ? req.body.date : undefined;
        await update.save();

        req.flash('green', 'Update edited successfully.');
        res.redirect('/admin/update/project');
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', 'Update not found!');
            return res.redirect('/admin/update/project');
        } else {
            req.flash('red', error.message);
            return res.redirect('/admin/update/project');
        }
    }
});

// GET delete project update
router.get("/project/delete/:id", checkAdmin, async (req, res) => {
    try {
        await Update.findByIdAndRemove(req.params.id);

        req.flash('green', 'Update deleted successfully.');
        res.redirect('/admin/update/project');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError') {
            req.flash('red', `Update not found!`);
            res.redirect('/admin/update/project');
        } else {
            req.flash('red', error.message);
            res.redirect('/admin/update/project');
        }
    }
});

// GET all benefit updates
router.get('/benefit', checkAdmin, async (req, res) => {
    try {
        const updates = await Update.find({ forBenefits: true }).sort('-_id');

        res.status(201).render('updates_benefit', {
            updates,
            image: req.admin.image,
        });
    } catch (error) {
        res.status(500).send('An error occured');
    }
});

// GET add benefit update
router.get('/benefit/add', checkAdmin, (req, res) => {
    res.render('add_update_benefit', { image: req.admin.image, });
});

// POST add benefit update
router.post('/benefit/add', checkAdmin, [
    check('EnName', 'Name must have a value').notEmpty(),
    check('FrName', 'Name must have a value').notEmpty(),
], async (req, res) => {
    try {
        const validationErrors = validationResult(req);
        if (validationErrors.errors.length > 0) {
            req.flash('red', validationErrors.errors[0].msg);
            return res.redirect(req.originalUrl);
        }

        await Update.create({
            en: {
                name: req.body.EnName,
            },
            fr: {
                name: req.body.FrName,
            },
            forBenefits: true,
            date: req.body.date ? req.body.date : undefined,
        });

        req.flash('green', 'Update added successfully.');
        res.redirect('/admin/update/benefit');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/admin/update/benefit');
    }
});

// GET edit benefit update
router.get("/benefit/edit/:id", checkAdmin, async (req, res) => {
    try {
        const update = await Update.findById(req.params.id);

        if (update == null) {
            req.flash('red', 'Update not found!');
            return res.redirect('/admin/update/benefit');
        }

        res.status(201).render("edit_update_benefit", {
            update,
            date: update.date.toISOString().split('T')[0],
            image: req.admin.image
        });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', 'Update not found!');
            return res.redirect('/admin/update/benefit');
        } else {
            req.flash('red', error.message);
            return res.redirect('/admin/update/benefit');
        }
    }
});

// POST edit benefit update
router.post("/benefit/edit/:id", checkAdmin, [
    check('EnName', 'Name must have a value').notEmpty(),
    check('FrName', 'Name must have a value').notEmpty(),
], async (req, res) => {
    try {
        const validationErrors = validationResult(req);
        if (validationErrors.errors.length > 0) {
            req.flash('red', validationErrors.errors[0].msg);
            return res.redirect(req.originalUrl);
        }

        const update = await Update.findById(req.params.id);

        if (update == null) {
            req.flash('red', 'Update not found!');
            return res.redirect('/admin/update/benefit');
        }

        update.en.name = req.body.EnName;
        update.fr.name = req.body.FrName;
        update.date = req.body.date ? req.body.date : undefined;
        await update.save();

        req.flash('green', 'Update edited successfully.');
        res.redirect('/admin/update/benefit');
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', 'Update not found!');
            return res.redirect('/admin/update/benefit');
        } else {
            req.flash('red', error.message);
            return res.redirect('/admin/update/benefit');
        }
    }
});

// GET delete benefit update
router.get("/benefit/delete/:id", checkAdmin, async (req, res) => {
    try {
        await Update.findByIdAndRemove(req.params.id);

        req.flash('green', 'Update deleted successfully.');
        res.redirect('/admin/update/benefit');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError') {
            req.flash('red', `Update not found!`);
            res.redirect('/admin/update/benefit');
        } else {
            req.flash('red', error.message);
            res.redirect('/admin/update/benefit');
        }
    }
});

module.exports = router;