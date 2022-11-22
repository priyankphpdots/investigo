const router = require('express').Router();

const checkAdmin = require('../../middleware/authAdminMiddleware');

const Withdraw = require('../../models/withdrawModel');

// GET all withdraw requests
router.get('/', checkAdmin, async (req, res) => {
    try {
        const withdraws = await Withdraw.find()
            .sort({ _id: -1 })
            .populate('user paymentMethod');

        res.render("withdraw", {
            withdraws,
            image: req.admin.image
        });
    } catch (error) {
        res.send(error.message);
    }
});

// GET withdraw
router.get('/:id', checkAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const withdraw = await Withdraw.findById(id)
            .populate('user paymentMethod order');

        if (withdraw == null) {
            req.flash('red', `Withdraw not found!`);
            return res.redirect('/admin/withdraw');
        }

        res.render("withdraw_view", {
            withdraw,
            image: req.admin.image
        });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', `Withdraw not found!`);
            res.redirect('/admin/withdraw');
        } else {
            res.send(error);
        }
    }
});

// change status to paid
router.get('/paid/:id', checkAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        await Withdraw.findByIdAndUpdate(id, { status: 'paid' });
        req.flash('green', 'Withdraw status changed to paid.');
        res.redirect('/admin/withdraw');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError') {
            req.flash('red', `Withdraw not found!`);
        } else {
            req.flash('red', error.message);
        }
        res.redirect('/admin/withdraw');
    }
});

module.exports = router;