const router = require('express').Router();

const checkAdmin = require('../../middleware/authAdminMiddleware');

const User = require('../../models/userModel');
const Order = require('../../models/orderModel');
const PaymentMethod = require('../../models/paymentMethodModel');

// Get all user
router.get('/', checkAdmin, async (req, res) => {
    const users = await User.find().sort('-_id');
    res.render("user", {
        users,
        image: req.admin.image
    });
});

// Get all user pagination
// router.get('/', checkAdmin, async (req, res) => {
//     const page = req.query.page || 1;
//     const perPage = 10;
//     const skip = (page - 1) * perPage;

//     const [users, count] = await Promise.all([
//         User.find().sort('-_id').skip(skip).limit(perPage),
//         User.count()
//     ])

//     res.render("user_pagination", {
//         users,
//         skip,
//         current: page,
//         pages: Math.ceil(count / perPage),
//         image: req.admin.image
//     });
// });

// GET user by id
router.get('/:id', checkAdmin, async (req, res) => {
    try {
        const [user, paymentMethods, allOrders] = await Promise.all([
            User.findById(req.params.id),
            PaymentMethod.find({ user: req.params.id }),
            Order.find({ user: req.params.id })
                .populate('project package')
                .sort('-_id')
        ]);

        if (user == null) {
            req.flash('red', 'User not found!');
            return res.redirect('/admin/user');
        }

        // current investment and completed orders
        var current = [];
        var orders = [];
        allOrders.forEach(ele => {
            ele.withdrawn == true ? orders.push(ele) : current.push(ele);
        });

        res.render('user_view', {
            user,
            orders,
            current,
            paymentMethods,
            image: req.admin.image
        });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', `User not found!`);
        } else {
            req.flash('red', error.message);
        }
        res.redirect('/admin/user');
    }
})

// block user
router.get('/block/:id', checkAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findByIdAndUpdate(id, { blocked: true });
        req.flash('green', `'${user.fname} ${user.lname}' blocked Successfully.`);
        res.redirect('/admin/user');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError') {
            req.flash('red', `User not found!`);
        } else {
            req.flash('red', error.message);
        }
        res.redirect('/admin/user');
    }
})

// unblock user
router.get('/unblock/:id', checkAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findByIdAndUpdate(id, { blocked: false });
        req.flash('green', `'${user.fname} ${user.lname}' unblock successfully.`);
        res.redirect('/admin/user');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError') {
            req.flash('red', `User not found!`);
        } else {
            req.flash('red', error.message);
        }
        res.redirect('/admin/user');
    }
})

module.exports = router;
