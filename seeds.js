const mongoose = require("mongoose");
const Product = require('./models/product');

const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://127.0.0.1:27017/farmStand')
    .then(() => app.listen(PORT, () => { console.log(`Connected to DB & Server running on port: ${PORT}`); }))
    .catch(err => console.log(err.message));

const seedPoducts = [{
    name: 'Fairy Eggplant',
    price: 1.00,
    category: 'vegetable'
},
{
    name: 'Organic Goddess Melon',
    price: 4.99,
    category: 'fruit'
}, {
    name: 'Organic Mini Seedless Watermelon',
    price: 3.99,
    category: 'fruit'
}, {
    name: 'Organic Celery',
    price: 3.99,
    category: 'vegetable'
}];

Product.insertMany(seedPoducts).then(res => { console.log(res) }).catch(err => { console.log(err) });