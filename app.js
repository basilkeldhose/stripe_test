
if (process.env.NODE_ENV !== 'production') {
    require('dotenv')
}
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

console.log(stripePublicKey, stripeSecretKey)

const express = require('express')
const app = express();
const fs = require('fs')
const { json } = require('body-parser')
const stripe =require('stripe')(stripeSecretKey)

app.use(express.json());
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/store', (req, res) => {
    fs.readFile('items.json', (error, data) => {
        if (error) {
            res.status(500).end()
        } else {
            res.render('store', {
                stripePublicKey: stripePublicKey,
                items: JSON.parse(data)
            })
        }
    })
});
app.post('/purchase', (req, res) => {
    fs.readFile('items.json', (error, data) => {
        if (error) {
            res.status(500).end()
        } else {
            const itemsJson =JSON.parse(data)
            const itemArray =itemsJson.music.connect(itemsJson.merch)
            let total =0
            req.body.items.forEach((items)=>{
                const itemsJson =itemArray.find((i)=>{
                    return i.id == item.id
                })
                total =total+ itemsJson.price*item.quantity
            })
            stripe.charges.create({
                amount:total,
                source:req.body.stripeTokenId,
                currency:'usd'
            }).then(()=>{
                console.log("charge sucessfully")
                json.send({message:"sucessfully purchased items... "})
            }).cath(()=>{
                console.log("charge failed")
                res.status(500).end()
            })
        }
    })
})
app.listen(8001, () => {
    console.log('server is connected on port in 8001..!!!');
})