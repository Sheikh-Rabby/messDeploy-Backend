 const adminModel=require('../model/AdminModel.js')
 const UserModel = require("../model/UserModel.js");
const {EncodeToken}=require('../Helper/TokenHelper.js')

 const AdminSignUpService=async (req,res)=>{

    let  reqbody=req.body;

    let existingUser = await adminModel.findOne({email:reqbody.email});
    if(existingUser){
        return {status:"fail",message:"User already exists"};
    }
    let data =await adminModel.create(reqbody)

     return{status:"success",data:data}

 }
 const AdminLoginService=async (req,res)=> {
     const {email, password} = req.body;
     let user = await adminModel.findOne({email: email});
     if (!user) {
         return {status: "fail", message: "user not found"};
     }
     if (user.password !== password) {
         return {status: "fail", message: "password incorrect"};
     }
     token = EncodeToken(email, user._id.toString());
     return {
         status: "success",token:token, data:user

     }
 }
 module.exports={AdminLoginService,AdminSignUpService}
