const express = require('express');
const app = express();
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const AppError = require('./AppError');

const Product = require('./models/product');

dotenv.config();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://127.0.0.1:27017/farmStand')
    .then(() => app.listen(PORT, () => { console.log(`Connected to DB & Server running on port: ${PORT}`); }))
    .catch(err => console.log(err.message));

app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
}

const categories = ['fruit', 'vegetable', 'dairy'];

app.get('/products', wrapAsync(async (req, res) => {
    const { category } = req.query;
    if (category) {
        const products = await Product.find({ category });
        res.render('products/index', { products, category });
    } else {
        const products = await Product.find({});
        res.render('products/index', { products, category: 'All' });
    }
}))

app.post('/products', wrapAsync(async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.redirect(`/products/${newProduct._id}`);
}))

app.get('/product/new', (req, res) => {
    res.render('products/new', { categories });
})

app.get('/products/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
        throw new AppError('Product Not Found', 404);
    }
    res.render('products/show', { product });
}))

app.get('/products/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
        throw new AppError('Product Not Found', 404);
    }
    res.render('products/edit', { product, categories })
}))

app.put('/products/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    res.redirect(`/products/${product._id}`);
}))

app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    res.redirect('/products');
})

const handleValidationErr = err => {
    console.dir(err);
    return new AppError(`Validation Failed...${err.message}`, 400)
}

app.use((err, req, res, next) => {
    console.log(err.name);
    //singling out out particular types of Mongoose Errors:
    if (err.name === 'ValidationError') err = handleValidationErr(err)
    next(err);
})

app.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong' } = err;
    res.status(status).send(message);
})