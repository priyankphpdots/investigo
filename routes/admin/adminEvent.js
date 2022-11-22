const router = require('express').Router();
const { check, validationResult } = require('express-validator');

const checkAdmin = require('../../middleware/authAdminMiddleware');
const Event = require('../../models/eventModel');

// GET all events
router.get('/', checkAdmin, async (req, res) => {
    try {
        const events = await Event.find({ forBenefits: false })
            .sort('-_id');

        res.status(201).render('events', {
            events,
            image: req.admin.image,
        });
    } catch (error) {
        res.status(500).send('An error occured');
    }
});

// GET add event
router.get('/add', checkAdmin, async (req, res) => {
    res.render('add_event', { image: req.admin.image });
});

// POST add event
router.post('/add', checkAdmin, [
    check('EnName', 'Name must have a value').notEmpty(),
    check('EnDesc', 'Description must have a value').notEmpty(),
    check('FrName', 'Name must have a value').notEmpty(),
    check('FrDesc', 'Description must have a value').notEmpty(),
], async (req, res) => {
    try {
        const validationErrors = validationResult(req);
        if (validationErrors.errors.length > 0) {
            req.flash('red', validationErrors.errors[0].msg);
            return res.redirect(req.originalUrl);
        }

        await Event.create({
            en: {
                name: req.body.EnName,
                description: req.body.EnDesc,
            },
            fr: {
                name: req.body.FrName,
                description: req.body.FrDesc,
            },
            date: req.body.date ? req.body.date : undefined,
        });

        req.flash('green', 'Event added successfully.');
        res.redirect('/admin/event');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/admin/event');
    }
});

// GET edit event
router.get("/edit/:id", checkAdmin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (event == null) {
            req.flash('red', 'Event not found!');
            return res.redirect('/admin/event');
        }

        res.status(201).render("edit_event", {
            event,
            date: event.date.toISOString().split('T')[0],
            image: req.admin.image
        });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', 'Event not found!');
            return res.redirect('/admin/event');
        } else {
            req.flash('red', error.message);
            return res.redirect('/admin/event');
        }
    }
});

// POST edit event
router.post("/edit/:id", checkAdmin, [
    check('EnName', 'Name must have a value').notEmpty(),
    check('EnDesc', 'Description must have a value').notEmpty(),
    check('FrName', 'Name must have a value').notEmpty(),
    check('FrDesc', 'Description must have a value').notEmpty(),
], async (req, res) => {
    try {
        const validationErrors = validationResult(req);
        if (validationErrors.errors.length > 0) {
            req.flash('red', validationErrors.errors[0].msg);
            return res.redirect(req.originalUrl);
        }

        const event = await Event.findById(req.params.id);

        if (event == null) {
            req.flash('red', 'Event not found!');
            return res.redirect('/admin/event');
        }

        event.en.name = req.body.EnName;
        event.en.description = req.body.EnDesc;
        event.fr.name = req.body.FrName;
        event.fr.description = req.body.FrDesc;
        event.date = req.body.date ? req.body.date : undefined;
        await event.save();

        req.flash('green', 'Event edited successfully.');
        res.redirect('/admin/event');
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', 'Event not found!');
            return res.redirect('/admin/event');
        } else {
            req.flash('red', error.message);
            return res.redirect('/admin/event');
        }
    }
});

// GET delete event
router.get("/delete/:id", checkAdmin, async (req, res) => {
    try {
        await Event.findByIdAndRemove(req.params.id);

        req.flash('green', 'Event deleted successfully.');
        res.redirect('/admin/event');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError') {
            req.flash('red', `Event not found!`);
            res.redirect('/admin/event');
        } else {
            req.flash('red', error.message);
            res.redirect('/admin/event');
        }
    }
});

module.exports = router;