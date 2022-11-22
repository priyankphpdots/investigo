const router = require('express').Router();

const checkAdmin = require('../../middleware/authAdminMiddleware');

const Application = require('../../models/applicationModel');

// GET all applications
router.get('/', checkAdmin, async (req, res) => {
    try {
        const applications = await Application.find().sort({ _id: -1 });
        res.render("admin_application", {
            applications,
            image: req.admin.image
        })
    } catch (error) {
        res.send(error.message)
    }
})

// GET an application
router.get('/:id', checkAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const application = await Application.findById(id);
        if (application == null) {
            req.flash('red', `Application not found!`);
            return res.redirect('/admin/application');
        }
        res.render("admin_application_view", {
            application,
            image: req.admin.image
        })
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', `Application not found!`);
            res.redirect('/admin/application');
        } else {
            res.send(error)
        }
    }
})

module.exports = router;