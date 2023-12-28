const UserModel = require('../models/userModel');
const mongoose = require('mongoose');
const ObjectID = mongoose.Types.ObjectId;


module.exports.getAllUsers = async (req, res) => {
    const users = await UserModel.find().select('-password'); //
    res.status(200).json(users);
}

module.exports.userInfo = async (req, res) => {
    console.log(req.params);
    try {
        if (!ObjectID.isValid(req.params.id)) {
            return res.status(400).send("ID unknown: " + req.params.id);
        }
        const user = await UserModel.findById(req.params.id).select('-password').exec();
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.send(user);
    } catch (err) {
        console.error('Error retrieving user information:', err);
        res.status(500).send("Internal Server Error");
    }
};

module.exports.updateUser = async (req, res) => {
    try {
        if (!ObjectID.isValid(req.params.id)) {
            return res.status(400).send("ID unknown: " + req.params.id);
        }
        const updatedUser = await UserModel.findOneAndUpdate(
            { _id: req.params.id },
            {
                $set: {
                    bio: req.body.bio
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        if (!updatedUser) {
            return res.status(404).send("User not found");
        }
        res.send(updatedUser);
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports.deleteUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
      return res.status(400).send("ID unknown: " + req.params.id)
    }

    try { 
        await UserModel.deleteOne({_id: req.params.id}).exec();
        res.status(200).json({message : "succesfully deleted. "});    
    }
    catch (err){
        res.status(500).json({ message: "Internal Server Error" });
    }
        
};