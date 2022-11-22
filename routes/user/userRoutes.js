const router = require('express').Router();
const createError = require('http-errors');
const S3 = require('../../helpers/s3');
const multilingual = require('../../helpers/multilingual');
const multilingualUser = require('../../helpers/multilingual_user');

const checkUser = require('../../middleware/authMiddleware');

const Package = require('../../models/packageModel');
const Project = require('../../models/projectModel');
const Blog = require('../../models/blogModel');
const Newsletter = require('../../models/newsletterModel');
const Application = require('../../models/applicationModel');
const Event = require('../../models/eventModel');
const Update = require('../../models/updateModel');

// multer
const multer = require('multer');
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true);
    } else {
        cb(createError.BadRequest('validation.resumeFile'), false);
    }
};
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

// GET all packages
router.get('/package', async (req, res, next) => {
    try {
        let packages = await Package.find().select('-__v');
        packages = packages.map(el => multilingual(el, req));

        res.json({
            status: "success",
            total: packages.length,
            packages
        });
    } catch (error) {
        next(error);
    }
});

// GET all projects
router.get('/project', async (req, res, next) => {
    try {
        let projects = await Project.find({ finished: false })
            .select('-__v')
            .sort('-_id');
        projects = projects.map(el => multilingual(el, req));

        res.json({
            status: "success",
            total: projects.length,
            projects
        });
    } catch (error) {
        next(error);
    }
});

// GET project by id
router.get('/project/:id', async (req, res, next) => {
    try {
        let [project, updates, events] = await Promise.all([
            Project.findById(req.params.id).select('-__v'),
            Update.find({ project: req.params.id }).select('-__v -project -forBenefits'),
            Event.find().select('-__v'),
        ]);

        if (project == null)
            return next(createError.NotFound('notFound.project'));

        project = multilingual(project, req);
        updates = updates.map(el => multilingual(el, req));
        project.updates = updates;
        events = events.map(el => multilingual(el, req));
        project.events = events;

        res.json({
            status: "success",
            project
        });
    } catch (error) {
        if (error.name == 'CastError') {
            return next(createError.NotFound('notFound.project'));
        }
        next(error);
    }
});

// GET all blogs
router.get('/blog', async (req, res, next) => {
    try {
        let blogs = await Blog.find()
            .select('-content -tags -creator -__v')
            .sort('-_id');
        blogs = blogs.map(el => multilingual(el, req));

        const counts = {};
        for (const el of blogs) {
            counts[el.category] = counts[el.category] ? counts[el.category] + 1 : 1;
        }

        res.json({
            status: "success",
            total: blogs.length,
            blogs,
            counts
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
});

// GET a blog with id
router.get('/blog/:id', async (req, res, next) => {
    try {
        let blog = await Blog.findById(req.params.id)
            .populate('creator', 'image name facebook twitter instagram linkedin')
            .select('-__v');

        if (blog == null)
            return next(createError.NotFound('notFound.blog'));

        blog = multilingual(blog, req);

        res.json({
            status: "success",
            blog
        });
    } catch (error) {
        if (error.name == 'CastError')
            return next(createError.NotFound('notFound.blog'));
        next(error);
    }
});

// POST add newsletter
router.post('/newsletter', async (req, res, next) => {
    try {
        const { email } = req.body;
        const emailExist = await Newsletter.findOne({ email });
        if (emailExist)
            return next(createError.BadRequest('newsletter.already'));

        await Newsletter.create({ email });
        res.status(201).json({
            status: 'success',
            message: req.t('newsletter.success')
        });
    } catch (error) {
        next(error);
    }
});

// POST application
router.post('/application', upload.single('resume'), async (req, res, next) => {
    try {
        if (req.file == undefined) {
            return next(createError.BadRequest('validation.resume'));
        }
        const result = await S3.uploadFile(req.file);
        const resume = result.Location;

        const application = new Application({
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            phone: req.body.phone,
            resume,
        });
        await application.save();

        res.status(201).json({
            status: "success",
            message: req.t('application')
        });
    } catch (error) {
        next(error);
    }
});

// GET events and key updates
router.get('/event-updates', async (req, res, next) => {
    try {
        let [events, updates] = await Promise.all([
            Event.find().select('-__v'),
            Update.find({ forBenefits: true }).select('-__v -forBenefits'),
        ]);

        events = events.map(el => multilingual(el, req));
        updates = updates.map(el => multilingual(el, req));

        res.json({
            status: "success",
            events,
            updates,
        });
    } catch (error) {
        next(error);
    }
});

// GET mark all read
router.get('/mark-all-read', checkUser, async (req, res, next) => {
    try {
        let notifications = req.user.notifications;
        notifications.forEach(ele => ele.read = true);
        req.user.notifications = notifications;
        await req.user.save();

        req.user = multilingualUser(req.user, req);
        res.json({
            status: "success",
            user: req.user,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;