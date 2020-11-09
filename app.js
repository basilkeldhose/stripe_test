const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
require('./dbSeller');
require('./dbproduct');
const Sellers = mongoose.model('sellers');
const Products = mongoose.model('products');
const { check, validationResult } = require("express-validator");
const { json } = require('body-parser');
const stripe = require('stripe')('sk_test_51Hh7GSDCUMC8SpWDMjJOEKTcIfwfLVlKQxGaPqvuMiMxF1vwFhrTu6tJBtyOERwUfq5Ks9uckfKDgNSw4ZATEp1A00bJ7K2VaH');
const stripePublicKey = "pk_test_51Hh7GSDCUMC8SpWD4K3SgUdlvMaLjSgyI3v4gmjZl5krco2Eph4NKuJvR1qJKkvFK1za7I9kOJHvdmqmkuhhDjF400o1hTiWTL"
const connection_Url = 'mongodb+srv://admin:XXpJ0kIxku72aaZd@cluster0.vtn35.mongodb.net/stripe-api?retryWrites=true&w=majority'
mongoose.connect(connection_Url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
app.use(express.json());
app.use(express.static('public'))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('index')
});
app.get('/seller', (req, res) => {
    res.render('seller')
});
const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.post('/seller', urlencodedParser, [
    check('name', 'this name must be 3+ charecter')
        .exists()
        .isLength({ min: 3 }),
    check('email', 'Email is not valied')
        .isEmail()
        .normalizeEmail()], (req, res) => {
            const error = validationResult(req)
            if (error.isEmpty()) {
                const alert = error.array()
                res.render('seller', {
                    alert
                });
            }
            const seller = new Sellers()
            seller.name = req.body.name
            seller.email = req.body.email
            seller.description = req.body.description
            Sellers.create(seller, (err, data) => {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.status(201).send(data);
                    var params = req.body
                    stripe.customers.create(params, (err, customer) => {
                        return err ? console.log(err) : console.log("sucess"+ customer);
                    });
                }
                seller.email = req.body.email;
            });
        });
app.post('/product', (req, res) => {
    const product = new Products()
    product.name = req.body.name
    product.price = req.body.price
    product.image_URL = req.body.image_URL
    Products.create(product, (err, data) => {
        return err ? res.status(500).send(err) : res.status(201).send(data);
    });
});
app.get("/product", (req, res) => {
    Products.find((err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
            fs.appendFile('items.json', `[${data}]`, (err) => {
                return err ? console.log(err) : console.log(data);
            });
        }
    });
});
app.get('/store', (req, res) => {
    fs.readFile('items.json', (error, data) => {
        if (error) {
            res.status(500).end();
        } else {
            res.render('store', {
                stripePublicKey: stripePublicKey,
                items: JSON.parse(data)
            });
        }
    });
});
app.post('/purchase', (req, res) => {
    fs.readFile('items.json', (error, data) => {
        if (error) {
            res.status(500).end();
        } else {
            const itemsJson = JSON.parse(data)
            const itemArray = itemsJson.music.connect(itemsJson.merch)
            let total = 0
            req.body.items.forEach((item) => {
                const itemsJson = itemArray.find((i) => {
                    return item.id == item.id;
                });
                total = total + itemsJson.price * item.quantity;
            });
            stripe.charges.create({
                amount: total,
                source: req.body.stripeTokenId,
                currency: 'usd'
            }).then(() => {
                console.log("charge sucessfully");
                json.send({ message: "sucessfully purchased items... " });
            }).cath(() => {
                console.log("charge failed")
                res.status(500).end();
            });
        };
    });
});
app.listen(8001, () => {
    console.log('server is connected on port in 8001..!!!');
});