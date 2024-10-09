import "dotenv/config";
import express, { Router } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import Stripe from "stripe";
import mongoose from "mongoose";
import serverless from "serverless-http"

const api = express();

api.use(cors());
api.use(bodyParser.json());

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.DATABASE_URL)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST);

const personSchema = new mongoose.Schema({
    message: String
})

const Person = mongoose.model("Person", personSchema)

const router = Router()

const storeItems = new Map([
    [1, {priceInCents: 19999, name: "Cetvel"}],
    [2, {priceInCents: 19999, name: "Ingilizce kitaplar"}],
    [3, {priceInCents: 19999, name: "Kareli Defter"}],
    [4, {priceInCents: 19999, name: "Cizgili Defter"}],
    [5, {priceInCents: 19999, name: "Hesap Makinesi"}], 
    ])


router.post('/create-checkout-session' , async (req, res) => {
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
router.get('/', (req, res) => {
    res.json({
        message: "Backend Working"
    })
})

api.use("/api/", router)

export const handler = serverless(api)
