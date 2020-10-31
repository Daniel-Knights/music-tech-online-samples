const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_TOKEN);
const paypal = require('@paypal/checkout-server-sdk');
const auth = require('../middleware/auth');
const notify = require('../middleware/notify');
const ObjectID = require('mongodb').ObjectID;

const connectDb = require('../config/db');

let environment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
);
let client = new paypal.core.PayPalHttpClient(environment);

async function usersCollection() {
    const connection = await connectDb;

    console.log(`MongoDB (account): ${connection.topology.s.state}`);

    return connection.db('mto').collection('users');
}

// Payment for a video-set via Stripe
router.post('/stripe/purchase-set', auth, notify, async (req, res) => {
    const users = await usersCollection();

    await stripe.paymentMethods
        .create({
            type: 'card',
            card: {
                token: req.body.userDetails.stripeToken,
            },
        })
        .then(method => {
            stripe.customers
                .create({
                    name: req.body.userDetails.name,
                    email: req.body.userDetails.email,
                    address: req.body.userDetails.addressDetails,
                    payment_method: method.id,
                })
                .then(customer => {
                    stripe.paymentIntents.create(
                        {
                            amount: req.body.userDetails.amount,
                            currency: 'gbp',
                            payment_method_types: ['card'],
                            payment_method: method.id,
                            customer: customer.id,
                            shipping: {
                                address: customer.address,
                                name: customer.name,
                                phone: req.body.userDetails.phone,
                            },
                            description: 'Music Tech Online video-set order',
                            metadata: {
                                reference_id: req.body.userDetails.referenceId,
                            },
                        },
                        function(err, paymentIntent) {
                            if (err) {
                                console.error(err);
                                return res.status(500).json({
                                    success: false,
                                    msg: err.raw.message,
                                });
                            } else {
                                stripe.paymentIntents.confirm(
                                    paymentIntent.id,
                                    { payment_method: method.id },
                                    async function(err, paymentIntent) {
                                        if (err) {
                                            return res.status(500).json({
                                                success: false,
                                                msg: err.raw.message,
                                            });
                                        } else {
                                            // Store set and order id for associated user
                                            await users
                                                .updateOne(
                                                    { _id: ObjectID(req.user._id) },
                                                    {
                                                        $addToSet: {
                                                            sets: req.body.set._uid,
                                                            orders: paymentIntent,
                                                        },
                                                    }
                                                )
                                                .then(data => {
                                                    console.log(data.result);
                                                    return res.status(201).json({
                                                        success: true,
                                                        msg: 'Payment Captured',
                                                        details: req.body,
                                                    });
                                                });
                                        }
                                    }
                                );
                            }
                        }
                    );
                })
                .catch(err => {
                    console.error(err);
                    return res.status(500).json({ success: false, msg: err.raw.message });
                });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ success: false, msg: err.raw.message });
        });
});

// Payment for a video-set via PayPal
// Create the order
router.post('/paypal/create-order', auth, (req, res) => {
    let request = new paypal.orders.OrdersCreateRequest();

    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
            {
                amount: {
                    currency_code: 'GBP',
                    value: req.body.price,
                },
            },
        ],
        application_context: {
            return_url: `${process.env.APP_URL}/payment?complete=true&id=${req.body._uid}`,
            cancel_url: `${process.env.APP_URL}/payment?complete=false&id=${req.body._uid}`,
        },
    });

    let createOrder = async function() {
        let response = await client.execute(request);

        return res.status(201).json({
            success: true,
            msg: 'Order created',
            response: response.result,
        });
    };

    createOrder().catch(err => {
        return res.status(500).json({
            success: false,
            msg: 'Unable to create order',
            error: JSON.parse(err._originalError.text).message,
        });
    });
});

// Capture the order
router.post('/paypal/capture-order', auth, notify, async (req, res) => {
    const users = await usersCollection();
    let request = new paypal.orders.OrdersCreateRequest();

    let captureOrder = async function(orderId) {
        request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});

        let response = await client.execute(request);

        // Store set and order id for associated user
        await users
            .updateOne(
                { _id: ObjectID(req.user._id) },
                {
                    $addToSet: {
                        sets: req.body.set._uid,
                        orders: response.result,
                    },
                }
            )
            .then(data => {
                console.log(data.result);
                return res.status(201).json({
                    success: true,
                    msg: 'Payment Captured',
                    details: req.body,
                });
            });
    };

    captureOrder(req.body.orderId).catch(err => {
        console.log(err);
        return res.status(500).json({
            success: false,
            msg: 'Unable to complete order',
            error: JSON.parse(err._originalError.text).message,
        });
    });
});

module.exports = router;
