// const mongoose = require("mongoose");

// const checkoutItemSchema = new mongoose.Schema({
//     productId : {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Product",
//         required: true,
//     },
//     name:{
//         type: String,
//         required: true,

//     },
//     Image:{
//         type: String,
//         required: true,
//     },
//     price:{
//         type: Number,
//         required:true,
//     },
//     quantity:{
//         type: Number,
//         required: true,
//     }
// },

// {_id: false}
// );

// const checkoutSchema = new mongoose.Schema({
//     user:{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true,
//     },
//     checkoutItems: [checkoutItemSchema],
//     shippingAddress: {
//         address : {type: String, required: true },
//         city : {type: String, required: true },
//         postalCode : {type: String, required: true },
//         country : {type: String, required: true },
//     },
//     paymentMethod:{
//         type: String,
//         required: true,
//     },
//     totalPrice: {
//         type: Number,
//         required: true,
//     },
//     isPaid:{
//         type: Boolean,
//         default: false,

//     },
//     paidAt:{
//         type:Date,
//     },
//     paymentStatus:{
//        type: String,
//        default: "Pending",
//     },
//     paymentDetails:{
//         type: mongoose.Schema.Types.Mixed,  //store payment -related details (transaction ID, paypal response)
//     },
//     isFinalized : {
//         type: Boolean,
//         default: false,
//     },
//     finalizedAt:{
//         type: Date,

//     },
// }, {timestamps: true}
// );

// module.exports = mongoose.model("Checkout", checkoutSchema);





const mongoose = require("mongoose");

const checkoutItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {  // ✅ Ensuring image is required
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    }
}, { _id: false });

const checkoutSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        checkoutItems: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
                name: { type: String, required: true },
                image: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true, default: 1 },
            },
        ],
        shippingAddress: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        paymentMethod: {
            type: String,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },
        paidAt: {
            type: Date,
        },
        paymentDetails: {
            transactionId: { type: String },
            paymentGateway: { type: String },
            amount: { type: Number },
            currency: { type: String, default: "USD" },
        },
        isFinalized: {
            type: Boolean,
            default: false,
        },
        finalizedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);
module.exports = mongoose.model("Checkout", checkoutSchema);
