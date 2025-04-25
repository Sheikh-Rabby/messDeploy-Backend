const express=require("express");
const router=express.Router();
const UserController=require("../Controller/UserController");
const AdminController=require("../Controller/AdminController");
const middleware=require("../MiddleWare/authVerify");
const {userFindById} = require("../Service/UserService");


router.post('/createUserProfile',UserController.createUserProfile)
router.post('/userLogin',UserController.userLogin)
router.post('/updateMeal',middleware,AdminController.updateMeal)
router.post('/updatePaid',middleware,AdminController.updatePaid)
router.get('/findUser',AdminController.findUser)
router.get('/userById/:id',UserController.userById)
router.get('/totalAmount',AdminController.totalAmount)
router.get('/totalDetail',AdminController.totalDetail)
router.get('/userTotalDetails/:id',AdminController.userTotalDetails)

router.post('/totalBazar',middleware,AdminController.totalBazar)
router.get('/bazar',AdminController.bazar)
router.get('/bazarBy/:buyerID',AdminController.bazarBy)

router.post('/adminSignUp',AdminController.adminSignUp)
router.post('/adminLogin',AdminController.adminLogin)

router.put('/resetData',UserController.resetData)





module.exports = router;