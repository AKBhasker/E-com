const express = require("express");

const User = require("../models/User");

const {protect, admin}  = require("../middleware/authMiddleware");

const router = express.Router();


// @route GET / api/admin/users
// @desc GET all users (Admin Only)
// Access Private admin

router.get("/", protect, admin, async (req, res) => {
    try {
        const users = await User.findOne({});
        res.json(users);
    } catch (error) {
     console.error(error);
     res.status(500).json({message: "server Error"})
    }
});

// @route POST /api/admin/users
// @desc Add a new user (admin only)
// @Access Private

router.post("/", protect, admin, async (req, res) => {
    const {name, email, password, role} = req.body;

    try {
        let user = await  User.findOne({email});
        if(user){
            return res.status(400).json({messge: "User already exists"})
        }
        user = new User({
            name,
            email,
            password,
            role: role || "customer", 
        });

        await user.save();
        res.status(201).json({message: "User created Successfully", user});
    } catch (error) {
        console.error(error);
        res.status(500).json({message  : "Server Error"});
    }
});

// route PUT api/admin/users/:id
// @desc Update user info (admin only) - Name, email, and role
// @access Private /Admin
router.put("/:id", protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;

            const updatedUser = await user.save();
            res.json({ message: "User updated Successfully", user: updatedUser });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }


});


// @route DELETE /api/admin/users/:id
// @desc Delete a user
// @access private Admin
router.delete("/:id", protect, admin, async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(user){
            await user.deleteOne();
            res.json({message  : "User deleted Successfully"});
        } else {
            res.status(404).json({message: "User not Found"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error"})

        
    }
} )

    

module.exports = router;