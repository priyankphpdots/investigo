const router = require('express').Router();

const checkAdmin = require('../../middleware/authAdminMiddleware');

const Message = require('../../models/messageModel');

// GET all messages
router.get('/', checkAdmin, async (req, res) => {
    try {
        const msgs = await Message.find().sort({ _id: -1 });
        res.render("admin_msg", {
            msgs,
            image: req.admin.image
        })
    } catch (error) {
        res.send(error.message)
    }
})

// GET a message
router.get('/:id', checkAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const message = await Message.findById(id);
        if (message == null) {
            req.flash('red', `Message not found!`);
            return res.redirect('/admin/message');
        }
        res.render("admin_msg_view", {
            message,
            image: req.admin.image
        })
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', `Message not found!`);
            res.redirect('/admin/message');
        } else {
            res.send(error)
        }
    }
})

module.exports = router;