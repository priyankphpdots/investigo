const router = require('express').Router();

const checkAdmin = require('../../middleware/authAdminMiddleware');

const Order = require('../../models/orderModel');

// Get all orders (complete orders)
router.get('/order', checkAdmin, async (req, res) => {
    const orders = await Order.find({ withdrawn: true })
        .populate('project package user')
        .sort('-_id');

    res.render("order", {
        orders,
        image: req.admin.image
    });
});

// Get all orders pagination
// router.get('/order', checkAdmin, async (req, res) => {
//     const page = req.query.page || 1;
//     const perPage = 10;
//     const skip = (page - 1) * perPage;

//     const [orders, count] = await Promise.all([
//         Order.find().sort('-_id').populate('project package user').skip(skip).limit(perPage),
//         Order.count()
//     ])

//     res.render("order_pagination", {
//         orders,
//         skip,
//         current: page,
//         pages: Math.ceil(count / perPage),
//         image: req.admin.image
//     });
// });

// GET order by id
router.get('/order/:id', checkAdmin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('project package user')

        if (order == null) {
            req.flash('red', 'Order not found!');
            return res.redirect('/admin/order');
        }

        res.render('order_view', {
            order,
            image: req.admin.image
        })
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', `Order not found!`);
        } else {
            console.log(error);
            req.flash('red', error.message);
        }
        res.redirect('/admin/order');
    }
})

// GET current investments
router.get('/investment', checkAdmin, async (req, res) => {
    const investments = await Order.find({ withdrawn: false })
        .populate('project package user')
        .sort('-_id');

    res.render("investment", {
        investments,
        image: req.admin.image
    });
});

module.exports = router;