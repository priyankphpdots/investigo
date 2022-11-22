const router = require('express').Router();
const createError = require('http-errors');
const paypal = require('../../helpers/paypal');

const checkUser = require('../../middleware/authMiddleware');

const Package = require('../../models/packageModel');
const Project = require('../../models/projectModel');
const Order = require('../../models/orderModel');

// create order
router.post('/create-order', async (req, res, next) => {
    try {
        const package = await Package.findById(req.body.package);
        if (!package)
            return next(createError.BadRequest('Invalid package id.'));

        const order = await paypal.createOrder(package.price);
        res.json({
            status: 'success',
            order,
        });
    } catch (error) {
        res.send(error);
    }
});

// place order
router.post('/place-order', checkUser, async (req, res, next) => {
    try {
        const response = await paypal.retriveOrder(req.body.orderId);
        if (response.status !== 'COMPLETED')
            return res.send({
                status: 'fail',
                message: `Payment status: '${response.status}'`,
            });

        const [package, project] = await Promise.all([
            Package.findById(req.body.package),
            Project.findById(req.body.project),
        ]);

        if (!package)
            return next(createError.BadRequest('Invalid package id.'));
        if (!project)
            return next(createError.BadRequest('Invalid project id.'));
        if (response.purchase_units[0].amount.value != package.price)
            return next(
                createError.BadRequest(
                    'Price paid and package price do not match!'
                )
            );
        if (project.totalAmount - project.invested < package.price)
            return next(createError.BadRequest('Project limit is reached.'));

        // create order
        const date = new Date(Date.now());
        date.setMonth(date.getMonth() + package.term);

        const returnAmount = (
            (1 + package.annualReturn / 100) *
            package.price
        ).toFixed(2);

        const order = await Order.create({
            user: req.user.id,
            package: req.body.package,
            project: req.body.project,
            orderId: req.body.orderId,
            endDate: date,
            paymentType: 'card',
            amount: package.price,
            returnAmount,
        });

        // update investors and invested in project
        project.investors = project.investors + 1;
        project.invested = project.invested + package.price;
        await project.save();

        res.send({ status: 'success', order });
    } catch (error) {
        if (error.code === 11000)
            return next(
                createError.BadRequest(
                    'Order already created with this orderId.'
                )
            );
        if (error.name === 'CastError')
            return next(
                createError.BadRequest('Invalid id for package or project.')
            );
        next(error);
    }
});

module.exports = router;
