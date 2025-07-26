// const express = require("express");
// const Checkout = require("../models/Checkout");
// const Cart = require("../models/Cart");
// const Product = require("../models/Product");
// const Order = require("../models/Order");
// const {protect} = require("../middleware/authMiddleware");

// const  router = express.Router()

// // @route POST /api/checkout
// // @desc create a new checkout sesion
// // @access Private

// router.post("/", protect, async (req, res) =>{
//    const {checkoutItems, shippingAddress, paymentMethod , totalPrice} =  req.body;

//    if(!checkoutItems || checkoutItems.length === 0) {
//     return res.status(400).json({message: "no items in checkout"})
//    }

//    try {
//     //  create a new checkout Session 
//     const newCheckout = await Checkout.create({
//         user: req.user._id,
//         checkoutItems: checkoutItems,
//         shippingAddress,
//         paymentMethod,
//         totalPrice,
//         paymentStatus: "Pending",
//         isPaid: false,    
//     });
//     console.log(`Checkout created for user: ${req.user._id}`);
//     res.status(201).json(newCheckout);
//    } catch (error) {
//     console.error("Error Creating checkout session:", error);
//     res.status(500).json({message: "Server Error"})
//    }
// });

// // @route PUT/api/checkout/:id/pay
// // @desc Update checkout to mark as paid after successful payment 
// // @access Private
// router.put("/:id/pay", protect, async (req, res) => {
//  const {paymentStatus, paymentDetails} = req.body; 
 

//  try {
//     const checkout =  await Checkout.findById(req.params.id);

//     if(!checkout){
//         return res.status(404).json({message: "Checkout not found "})
//     }

//     if(paymentStatus === "paid"){
//         checkout.isPaid = true;;
//         checkout.paymentStatus = paymentStatus;
//         checkout.paymentDetails = paymentDetails;
//         checkout.paidAt = Date.now();
//         await checkout.save();

//         res.status(200).json(checkout);

//     }else {
//         res.status(400).json({message: "Invalid Payment Status"});
//     }
//  } catch (error) {
//     console.error(error);
//     res.status(500).json({message: "Server Error"}) 
//  }
// });

// //  @route Post api/checkout/:id/finalize 
// //  @desc Finalize checkout out convert to an order after payment confirmation
// //  @access Private 
// router.post("/:id/finalize", protect , async (req, res) => {
   
//     try {
//         const checkout = await Checkout.findById(req.params.id);

//         if(!checkout){
//             return res.status(404).json({message: "Checkout not found"});
//         }

//         if (checkout.isPaid && !checkout.isFinalized)
//             {
//             // Create final order based on the checkout details 
//            const finalOrder  = await Order.create({
//              user: checkout.user,
//              orderItems: checkout.checkoutItems,
//              shippingAddress: checkout.shippingAddress,
//              paymentMethod: checkout.paymentMethod,
//               totalPrice: checkout.totalPrice,
//               isPaid: true,
//               paidAt: checkout.paidAt,
//               isDelivered: false,
//               paymentStatus: "paid",
//               paymentDetails: checkout.paymentDetails,

//            }) ;

//         //    mark the checkout  as finalized
//         checkout.isFinalized = true;
//         checkout.finalizedAt = Date.now();
//         await checkout.save();

//         // Delete the cart associated with the user

//         await Cart.findOneAndDelete({ user: checkout.user});
//         res.status(201).json(finalOrder);


//         } else if(checkout.isFinalized) { 
//             res.status(400).json({message: "Checkout already finalized"})
//         } else {
//            res.status(400).json({message: "Checkout is not paid"});  
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({message:"Server Error"});
        
//     }
// });

// module.exports = router;




const express = require("express");
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// @route POST /api/checkout
// @desc Create a new checkout session
// @access Private
router.post("/", protect, async (req, res) => {
    const { checkoutItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (!checkoutItems || checkoutItems.length === 0) {
        return res.status(400).json({ message: "No items in checkout" });
    }

    try {
        const newCheckout = await Checkout.create({
            user: req.user._id,
            checkoutItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            paymentStatus: "Pending",
            isPaid: false,
        });

        console.log(`Checkout created for user: ${req.user._id}`);
        res.status(201).json(newCheckout);
    } catch (error) {
        console.error("Error Creating checkout session:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route PUT /api/checkout/:id/pay
// @desc Update checkout to mark as paid after successful payment
// @access Private
router.put("/:id/pay", protect, async (req, res) => {
    try {
        const checkout = await Checkout.findById(req.params.id);

        if (!checkout) {
            return res.status(404).json({ message: "Checkout not found" });
        }

        // ✅ Ensure paymentStatus is "paid" when payment is completed
        checkout.isPaid = true;
        checkout.paymentStatus = "paid";
        checkout.paidAt = Date.now();
        checkout.paymentDetails = {
            transactionId: req.body.transactionId || "txn_" + Date.now(),
            paymentGateway: req.body.paymentGateway || "PayPal",
            amount: checkout.totalPrice,
            currency: "USD",
        };

        await checkout.save();

        res.status(200).json(checkout); // ✅ Response includes `paymentStatus: "paid"`
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route POST /api/checkout/:id/finalize
// @desc Finalize checkout and convert to an order after payment confirmation
// @access Private
router.post("/:id/finalize", protect, async (req, res) => {
    try {
        const checkout = await Checkout.findById(req.params.id);

        if (!checkout) {
            return res.status(404).json({ message: "Checkout not found" });
        }

        if (checkout.isPaid && !checkout.isFinalized) {
            const finalOrder = await Order.create({
                user: checkout.user,
                orderItems: checkout.checkoutItems.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    image: item.image || "https://picsum.photos/500/500?random=13", // Ensure image field is always present
                    price: item.price,
                    quantity: item.quantity,
                })),
                shippingAddress: checkout.shippingAddress,
                paymentMethod: checkout.paymentMethod,
                totalPrice: checkout.totalPrice,
                isPaid: true,
                paidAt: checkout.paidAt,
                isDelivered: false,
                paymentStatus: "paid",
                paymentDetails: checkout.paymentDetails,
            });

            checkout.isFinalized = true;
            checkout.finalizedAt = Date.now();
            await checkout.save();

            await Cart.findOneAndDelete({ user: checkout.user });

            res.status(201).json(finalOrder);
        } else if (checkout.isFinalized) {
            res.status(400).json({ message: "Checkout already finalized" });
        } else {
            res.status(400).json({ message: "Checkout is not paid" });
        }
    } catch (error) {
        console.error("Error finalizing checkout:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;