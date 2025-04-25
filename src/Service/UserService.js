const UserModel = require('../model/UserModel.js');
const {EncodeToken}=require('../Helper/TokenHelper.js')
const BazarModel = require("../model/BazarModel.js");
const mongoose = require("mongoose");

const createUserProfileService = async (req, res) => {
    try {
        let reqBody = req.body;


        let existingUser = await UserModel.findOne({ email: reqBody.email });
        if (existingUser) {
          return {status:"fail",message:"User already exists"};
        }

        let response = await UserModel.create(reqBody);
        return { status: "success", data: response };

    } catch (error) {
        return{ status: "fail", message: error.message };
    }
}

const userLoginService = async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await UserModel.findOne({email});
        if (!user) {
            return {status: "fail", message: "User not found"};
        }

        if (user.password !== password) {
            return {status: "fail", message: "Password is incorrect"};
        }

        let token;
        try {
            token = EncodeToken(email, user._id.toString());
        } catch (tokenErr) {
            return {status: "fail", message: "Token generation error"};
        }


        return {status: "success", token: token, data: user};

    } catch (err) {
        return {status: "fail", message: err.message};
    }
}


const userFindById = async (req,res) => {
    try {
       const id=req.params.id;

        let user = await UserModel.findOne({ _id: id })
        console.log("User Found:", user);

        if (!user) {
            return { status: "fail", message: "User not found" };
        }

        return { status: "success", data: user };

    } catch (err) {
        console.error("Database Error:", err.message);
        return { status: "error", message: "Something went wrong" };
    }
}

const Datareset = async (req, res) => {
    try {
        await Promise.all([
            UserModel.updateMany({}, {
                $set: {
                    total_paid_amount: 0,
                    total_meal: 0,
                    meal_history: []
                }
            }),
            BazarModel.updateMany({}, {
                date:null,
                amount:0,
                buyer:null,
                details:0


            })
        ]);

        return{ status: "success", message: "Successfully reset data from both tables" };

    } catch (err) {
        console.log(err.message);
        return { status: "error", message: "Failed to reset data" };
    }
};





module.exports = {createUserProfileService, userLoginService,userFindById,Datareset};
