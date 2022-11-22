const router = require('express').Router();
const S3 = require('../../helpers/s3');

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

// GET model
const Blog = require('../../models/blogModel');

// GET blog
router.get("/", checkAdmin, async (req, res) => {
    try {
        const blogs = await Blog.find().sort('-_id');
        res.status(201).render("blog", {
            blogs,
            image: req.admin.image
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("An error occured");
    }
});

// GET add blog
router.get("/add", checkAdmin, async (req, res) => {
    if (!req.admin.name) {
        req.flash('orange', 'You should create your profile before adding a blog.');
    }
    res.render("add_blog", { image: req.admin.image });
});

// POST add blog
router.post('/add', checkAdmin, upload.single('image'), async (req, res) => {
    try {
        let image;
        if (typeof req.file !== 'undefined') {
            const result = await S3.uploadFile(req.file);
            image = result.Location;
        }
        const tagsArray = req.body.tags.split(',').filter(item => item !== '');

        await Blog.create({
            en: {
                title: req.body.EnTitle,
                description: req.body.EnDesc,
                content: req.body.EnContent
            },
            fr: {
                title: req.body.FrTitle,
                description: req.body.FrDesc,
                content: req.body.FrContent
            },
            category: req.body.category,
            tags: tagsArray,
            creator: req.admin.id,
            image,
        });

        req.flash('green', `Blog added successfully`);
        res.redirect('/admin/blog');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/admin/blog');
    }
});

// GET edit blog
router.get("/edit/:id", checkAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const blog = await Blog.findById(id);
        if (blog == null) {
            req.flash('red', `Blog not found!`);
            return res.redirect('/admin/blog');
        }
        res.status(201).render("edit_blog", {
            blog,
            image: req.admin.image
        });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', `Blog not found!`);
            res.redirect('/admin/blog');
        } else {
            res.send(error);
        }
    }
});

// POST Edit blog
router.post('/edit/:id', checkAdmin, upload.single('image'), async (req, res) => {
    try {
        const id = req.params.id;
        const blog = await Blog.findById(id);
        if (blog == null) {
            req.flash('red', `Blog not found!`);
            return res.redirect('/admin/blog');
        }

        const tagsArray = req.body.tags.split(',').filter(item => item !== '');

        blog.en.title = req.body.EnTitle;
        blog.en.description = req.body.EnDesc;
        blog.en.content = req.body.EnContent;
        blog.fr.title = req.body.FrTitle;
        blog.fr.description = req.body.FrDesc;
        blog.fr.content = req.body.FrContent;
        blog.category = req.body.category;
        blog.tags = tagsArray;

        if (typeof req.file !== 'undefined') {
            const result = await S3.uploadFile(req.file);
            blog.image = result.Location;
        }

        await blog.save();

        req.flash('green', `Blog edited successfully`);
        res.redirect('/admin/blog');
    } catch (error) {
        res.send(error.message);
    }
});

// GET delete blog
router.get("/delete/:id", checkAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        await Blog.findByIdAndRemove(id);

        req.flash('green', `Blog deleted successfully`);
        res.redirect('/admin/blog');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError') {
            req.flash('red', `Blog not found!`);
            res.redirect('/admin/blog');
        } else {
            res.send(error);
        }
    }
});

// uploader
router.post('/upload', upload.single('upload'), async (req, res) => {
    try {
        let url;
        if (typeof req.file !== 'undefined') {
            const result = await S3.uploadFile(req.file);
            url = result.Location;
        }

        const send = `<script>window.parent.CKEDITOR.tools.callFunction('${req.query.CKEditorFuncNum}', '${url}');</script>`;
        res.send(send);
    } catch (error) {
        res.send(error.message);
    }
});

module.exports = router;