const router = require('express').Router();
const { check, validationResult } = require('express-validator');
const S3 = require('../../helpers/s3');

const Page = require('../../models/pageModel');
const FAQs = require('../../models/faqsModel');
const Career = require('../../models/careerModel');

const checkAdmin = require('../../middleware/authAdminMiddleware');

const multer = require('multer');
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10
    },
    fileFilter: fileFilter
});

// terms
router.get("/terms_con", checkAdmin, async (req, res) => {
    try {
        const page = await Page.findOne({ title: 'Terms & Condition' });
        res.status(201).render("terms", {
            page,
            image: req.admin.image
        });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect(req.originalUrl);
    }
});

router.post('/terms_con', checkAdmin, [
    check('EnContent', 'English content must have a value').notEmpty(),
    check('FrContent', 'French content must have a value').notEmpty(),
], async function (req, res) {
    const validationErrors = validationResult(req)
    if (validationErrors.errors.length > 0) {
        req.flash('red', validationErrors.errors[0].msg);
        return res.redirect(req.originalUrl);
    }
    try {
        const page = await Page.findOne({ title: 'Terms & Condition' });
        page.en.content = req.body.EnContent;
        page.fr.content = req.body.FrContent;
        await page.save();

        req.flash('green', 'Terms & Conditions updated successfully.');
        res.redirect('/admin/cms/terms_con');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect(req.originalUrl);
    }
});

// privacy
router.get("/privacy_policy", checkAdmin, async (req, res) => {
    try {
        const page = await Page.findOne({ title: 'Privacy Policy' });
        res.status(201).render("privacy", {
            page,
            image: req.admin.image
        });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect(req.originalUrl);
    }
});

router.post('/privacy_policy', checkAdmin, [
    check('EnContent', 'English content must have a value').notEmpty(),
    check('FrContent', 'French content must have a value').notEmpty(),
], async function (req, res) {
    const validationErrors = validationResult(req);
    if (validationErrors.errors.length > 0) {
        req.flash('red', validationErrors.errors[0].msg);
        return res.redirect(req.originalUrl);
    }
    try {
        const page = await Page.findOne({ title: 'Privacy Policy' });
        page.en.content = req.body.EnContent;
        page.fr.content = req.body.FrContent;
        await page.save();

        req.flash('green', 'Privacy Policy updated successfully.');
        res.redirect('/admin/cms/privacy_policy');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect(req.originalUrl);
    }
});

// cookie
router.get("/cookie_policy", checkAdmin, async (req, res) => {
    try {
        const page = await Page.findOne({ title: 'Cookie Policy' });
        res.status(201).render("cookie", {
            page,
            image: req.admin.image
        });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect(req.originalUrl);
    }
});

router.post('/cookie_policy', checkAdmin, [
    check('EnContent', 'English content must have a value').notEmpty(),
    check('FrContent', 'French content must have a value').notEmpty(),
], async function (req, res) {
    const validationErrors = validationResult(req);
    if (validationErrors.errors.length > 0) {
        req.flash('red', validationErrors.errors[0].msg);
        return res.redirect(req.originalUrl);
    }
    try {
        const page = await Page.findOne({ title: 'Cookie Policy' });
        page.en.content = req.body.EnContent;
        page.fr.content = req.body.FrContent;
        await page.save();

        req.flash('green', 'Cookie Policy updated successfully.');
        res.redirect('/admin/cms/cookie_policy');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect(req.originalUrl);
    }
});

// key risks
router.get("/key_risks", checkAdmin, async (req, res) => {
    try {
        const page = await Page.findOne({ title: 'Key Risks' });
        res.status(201).render("key_risks", {
            page,
            image: req.admin.image
        });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect(req.originalUrl);
    }
});

router.post("/key_risks", checkAdmin, [
    check('enDesc', 'English description must have a value').notEmpty(),
    check('frDesc', 'French description must have a value').notEmpty(),
], async function (req, res) {
    const validationErrors = validationResult(req);
    if (validationErrors.errors.length > 0) {
        req.flash('red', validationErrors.errors[0].msg);
        return res.redirect(req.originalUrl);
    }
    try {
        const page = await Page.findOne({ title: 'Key Risks' });
        page.en.content = req.body.enDesc;
        page.fr.content = req.body.frDesc;
        await page.save();

        req.flash('green', 'Key Risks updated successfully.');
        res.redirect('/admin/cms/key_risks');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect(req.originalUrl);
    }
});

// uploader
router.post('/upload', upload.single('upload'), async (req, res) => {
    try {
        let url;
        if (typeof req.file !== 'undefined') {
            const result = await S3.uploadFile(req.file);
            url = result.Location;
        };

        const send = `<script>window.parent.CKEDITOR.tools.callFunction('${req.query.CKEditorFuncNum}', '${url}');</script>`;
        res.send(send);
    } catch (error) {
        res.send(error.message);
    }
});

// GET all faqs
router.get("/faqs", checkAdmin, async (req, res) => {
    try {
        const faqs = await FAQs.find();
        res.status(201).render("faqs_new", {
            faqs,
            image: req.admin.image
        });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect(req.originalUrl);
    }
});

// GET add faq
router.get("/faqs/add", checkAdmin, async (req, res) => {
    res.render("add_faq", { image: req.admin.image });
});

// POST add faq
router.post("/faqs/add", checkAdmin, [
    check('EnQue', 'English question must have a value').notEmpty(),
    check('EnAns', 'English answer must have a value').notEmpty(),
    check('FrQue', 'French question must have a value').notEmpty(),
    check('FrAns', 'French answer must have a value').notEmpty(),
], async (req, res) => {
    try {
        const validationErrors = validationResult(req);
        if (validationErrors.errors.length > 0) {
            req.flash('red', validationErrors.errors[0].msg);
            return res.redirect(req.originalUrl);
        }

        await FAQs.create({
            en: {
                question: req.body.EnQue,
                answer: req.body.EnAns,
            },
            fr: {
                question: req.body.FrQue,
                answer: req.body.FrAns,
            },
            category: req.body.category,
        });

        req.flash('green', `FAQ added successfully.`);
        res.redirect('/admin/cms/faqs');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/admin/cms/faqs');
    }
});

// GET edit faq
router.get("/faqs/edit/:id", checkAdmin, async (req, res) => {
    try {
        const faq = await FAQs.findById(req.params.id);
        if (faq == null) {
            req.flash('red', `FAQ not found!`);
            return res.redirect('/admin/cms/faqs');
        }

        res.status(201).render("edit_faq", {
            faq,
            image: req.admin.image
        });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', `FAQ not found!`);
            res.redirect('/admin/cms/faqs');
        } else {
            req.flash('red', error.message);
            res.redirect('/admin/cms/faqs');
        }
    }
});

// POST edit faq
router.post('/faqs/edit/:id', checkAdmin, [
    check('EnQue', 'English question must have a value').notEmpty(),
    check('EnAns', 'English answer must have a value').notEmpty(),
    check('FrQue', 'French question must have a value').notEmpty(),
    check('FrAns', 'French answer must have a value').notEmpty(),
], async (req, res) => {
    try {
        const validationErrors = validationResult(req);
        if (validationErrors.errors.length > 0) {
            req.flash('red', validationErrors.errors[0].msg);
            return res.redirect(req.originalUrl);
        }

        const faq = await FAQs.findById(req.params.id);
        if (faq == null) {
            req.flash('red', `FAQ not found!`);
            return res.redirect('/admin/cms/faqs');
        }

        faq.en.question = req.body.EnQue;
        faq.en.answer = req.body.EnAns;
        faq.fr.question = req.body.FrQue;
        faq.fr.answer = req.body.FrAns;
        faq.category = req.body.category;
        await faq.save();

        req.flash('green', `FAQ edited successfully.`);
        res.redirect('/admin/cms/faqs');
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', `FAQ not found!`);
            res.redirect('/admin/cms/faqs');
        } else {
            req.flash('red', error.message);
            res.redirect(req.originalUrl);
        }
    }
});

// GET delete faq
router.get("/faqs/delete/:id", checkAdmin, async (req, res) => {
    try {
        await FAQs.findByIdAndRemove(req.params.id);

        req.flash('green', `FAQ deleted successfully.`);
        res.redirect('/admin/cms/faqs');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError') {
            req.flash('red', `FAQ not found!`);
            res.redirect('/admin/cms/faqs');
        } else {
            req.flash('red', error.message);
            res.redirect('/admin/cms/faqs');
        }
    }
});

// GET all careers
router.get("/career", checkAdmin, async (req, res) => {
    try {
        const careers = await Career.find().sort('-_id');
        res.status(201).render("career", {
            careers,
            image: req.admin.image
        });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect(req.originalUrl);
    }
});

// GET add career
router.get("/career/add", checkAdmin, async (req, res) => {
    res.render("add_career", { image: req.admin.image });
});

// POST add faq
router.post("/career/add", checkAdmin, [
    check('EnTitle', 'English title must have a value').notEmpty(),
    check('EnDescription', 'English description must have a value').notEmpty(),
    check('FrTitle', 'French title must have a value').notEmpty(),
    check('FrDescription', 'French description must have a value').notEmpty(),
    check('category', 'category must have a value').notEmpty(),
    check('location', 'location must have a value').notEmpty(),
    check('type', 'type must have a value').notEmpty(),
], async (req, res) => {
    try {
        const validationErrors = validationResult(req);
        if (validationErrors.errors.length > 0) {
            req.flash('red', validationErrors.errors[0].msg);
            return res.redirect(req.originalUrl);
        }

        await Career.create({
            en: {
                title: req.body.EnTitle,
                description: req.body.EnDescription,
                responsibilities: req.body.EnRes,
                requirements: req.body.EnReq,
                benefits: req.body.EnBen,
            },
            fr: {
                title: req.body.FrTitle,
                description: req.body.FrDescription,
                responsibilities: req.body.FrRes,
                requirements: req.body.FrReq,
                benefits: req.body.FrBen,
            },
            category: req.body.category,
            location: req.body.location,
            type: req.body.type,
        });

        req.flash('green', `Career added successfully.`);
        res.redirect('/admin/cms/career');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/admin/cms/career');
    }
});

// GET edit career
router.get("/career/edit/:id", checkAdmin, async (req, res) => {
    try {
        const career = await Career.findById(req.params.id);
        if (career == null) {
            req.flash('red', `Career not found!`);
            return res.redirect('/admin/cms/career');
        }

        res.status(201).render("edit_career", {
            career,
            image: req.admin.image
        });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', `Career not found!`);
            res.redirect('/admin/cms/career');
        } else {
            req.flash('red', error.message);
            res.redirect('/admin/cms/career');
        }
    }
});

// POST edit career
router.post('/career/edit/:id', checkAdmin, [
    check('EnTitle', 'English title must have a value').notEmpty(),
    check('EnDescription', 'English description must have a value').notEmpty(),
    check('FrTitle', 'French title must have a value').notEmpty(),
    check('FrDescription', 'French description must have a value').notEmpty(),
    check('category', 'category must have a value').notEmpty(),
    check('location', 'location must have a value').notEmpty(),
    check('type', 'type must have a value').notEmpty(),
], async (req, res) => {
    try {
        const validationErrors = validationResult(req);
        if (validationErrors.errors.length > 0) {
            req.flash('red', validationErrors.errors[0].msg);
            return res.redirect(req.originalUrl);
        }

        const career = await Career.findById(req.params.id);
        if (career == null) {
            req.flash('red', `FAQ not found!`);
            return res.redirect('/admin/cms/career');
        }

        career.en.title = req.body.EnTitle;
        career.en.description = req.body.EnDescription;
        career.en.responsibilities = req.body.EnRes;
        career.en.requirements = req.body.EnReq;
        career.en.benefits = req.body.EnBen;
        career.fr.title = req.body.FrTitle;
        career.fr.description = req.body.FrDescription;
        career.fr.responsibilities = req.body.FrRes;
        career.fr.requirements = req.body.FrReq;
        career.fr.benefits = req.body.FrBen;
        career.category = req.body.category;
        career.location = req.body.location;
        career.type = req.body.type;
        await career.save();

        req.flash('green', `Career edited successfully.`);
        res.redirect('/admin/cms/career');
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', `Career not found!`);
            res.redirect('/admin/cms/career');
        } else {
            req.flash('red', error.message);
            res.redirect(req.originalUrl);
        }
    }
});

// GET delete career
router.get("/career/delete/:id", checkAdmin, async (req, res) => {
    try {
        await Career.findByIdAndRemove(req.params.id);

        req.flash('green', `Career deleted successfully.`);
        res.redirect('/admin/cms/career');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError') {
            req.flash('red', `Career not found!`);
            res.redirect('/admin/cms/career');
        } else {
            req.flash('red', error.message);
            res.redirect('/admin/cms/career');
        }
    }
});

module.exports = router;