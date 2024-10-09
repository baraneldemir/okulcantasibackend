import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import Stripe from "stripe";
import mongoose from "mongoose";

const app = express();

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
console.log(`Server listening on ${PORT}`);
});

mongoose.connect(process.env.DATABASE_URL)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST);

const personSchema = new mongoose.Schema({
    message: String
})

const Person = mongoose.model("Person", personSchema)


const storeItems = new Map([
    [1, {priceInCents: 99999, name: "Cetvel"}],
    [2, {priceInCents: 99999, name: "Ingilizce kitaplar"}],
    [3, {priceInCents: 99999, name: "Kareli Defter"}],
    [4, {priceInCents: 99999, name: "Cizgili Defter"}],
    [5, {priceInCents: 99999, name: "Hesap Makinesi"}], 
    ])



app.get('/', (req, res) => {
    res.json({
        message: "Backend Working"
    })
})


app.post('/create-checkout-session' , async (req, res) => {
    try {
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: req.body.items.map(item => {
                const storeItem = storeItems.get(item.id)
                return {
                    price_data: {
                        currency: 'TRY',
                        product_data: {
                            name: storeItem.name
                        },
                        unit_amount: storeItem.priceInCents
                    },
                    quantity: 1,
                }
            }),
            success_url: `${process.env.FRONTEND_URL}/`,
            cancel_url:  `${process.env.FRONTEND_URL}/`,
        })
        res.json({ url: session.url })
    } catch (e) {
        res.status(500).json({ error: e.message})
    }
    
})