 const mongoose= require('mongoose');
 const BazarModel=mongoose.Schema({
     date:{type:Date, required: true, get: (date) => date.toISOString().split('T')[0]},
     amount:{type:Number,required: true},
     buyer:{type:mongoose.Schema.Types.ObjectId, ref:'User',required:true},
     details:{type:String},
 },{timestamps:true,versionKey:false})
 const Bazar=mongoose.model('Bazar',BazarModel);
 module.exports = Bazar;