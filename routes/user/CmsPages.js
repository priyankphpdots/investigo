const router = require('express').Router();
const createError = require('http-errors');
const multilingual = require('../../helpers/multilingual');

// models
const Page = require('../../models/pageModel');
const FAQs = require('../../models/faqsModel');
const Message = require('../../models/messageModel');
const Career = require('../../models/careerModel');

// faqs
router.get("/faqs", async (req, res, next) => {
    try {
        let faqs = await FAQs.find().select('-_id -__v');
        faqs = faqs.map(el => multilingual(el, req));

        res.json({
            status: "success",
            content: faqs
        });
    } catch (error) {
        next(error);
    }
});

// terms
router.get("/terms_con", async (req, res, next) => {
    try {
        let page = await Page.findOne({ title: 'Terms & Condition' });
        page = multilingual(page, req);
        const content = page.content;
        res.json({
            status: "success",
            content
        });
    } catch (error) {
        next(error);
    }
});

// privacy
router.get("/privacy_policy", async (req, res, next) => {
    try {
        let page = await Page.findOne({ title: 'Privacy Policy' });
        page = multilingual(page, req);
        const content = page.content;
        res.json({
            status: "success",
            content
        });
    } catch (error) {
        next(error);
    }
});

// cookie
router.get("/cookie_policy", async (req, res, next) => {
    try {
        let page = await Page.findOne({ title: 'Cookie Policy' });
        page = multilingual(page, req);
        const content = page.content;
        res.json({
            status: "success",
            content
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
});

// key risks
router.get("/key_risks", async (req, res, next) => {
    try {
        let page = await Page.findOne({ title: 'Key Risks' });
        page = multilingual(page, req);
        const content = page.content;
        res.json({
            status: "success",
            content
        });
    } catch (error) {
        next(error);
    }
});

// GET all careers
router.get('/career', async (req, res, next) => {
    try {
        let careers = await Career.find();
        careers = careers.map(el => multilingual(el, req));

        const categories = new Set();
        careers.forEach(el => categories.add(el.category));

        res.json({
            status: "success",
            categories: [...categories],
            careers,
        });
    } catch (error) {
        next(error);
    }
});

// GET a career with id
router.get('/career/:id', async (req, res, next) => {
    try {
        let career = await Career.findById(req.params.id);
        career = multilingual(career, req);

        if (career == null)
            return next(createError.NotFound('Career not found!'));

        res.json({
            status: "success",
            career
        });
    } catch (error) {
        if (error.name == 'CastError')
            return next(createError.NotFound('Career not found!'));
        next(error);
    }
});

// POST message
router.post("/contact", async (req, res, next) => {
    try {
        const message = await Message.create(req.body);

        io.emit('msg', message);
        res.status(201).json({
            status: "success",
            message: req.t('msg'),
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;