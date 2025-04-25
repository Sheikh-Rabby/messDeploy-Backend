const mongoose= require('mongoose')
const AdminModel=mongoose.Schema({

    name: {type: String,required: true},
    email: {type: String,required: true},
    password: {type: String,required: true}
},{timestamps: true, versionKey: false});
const adminModel= mongoose.model('AdminModel',AdminModel)
module.exports = adminModel;