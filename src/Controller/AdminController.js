const {updateMealService,UpdatePaidAmount,findUserService,calculateTotalPaidAmount,userTotalDetails,totalBazarDetails,userTotalDetailsById,bazarFound,bazarFoundById } =require("../Service/AdminService.js")
const {AdminSignUpService,AdminLoginService}=require("../Service/AdminLoginService.js")


exports.updateMeal=async (req, res) => {
    let result=await updateMealService(req)
    return(res.status(200).json(result))
}
exports.updatePaid=async (req, res) => {
    let result=await UpdatePaidAmount(req)
    return(res.status(200).json(result))
}
exports.findUser=async (req, res) => {
    let result=await findUserService()
    return(res.status(200).json(result))
}
exports.totalAmount=async (req, res) => {
    let result=await calculateTotalPaidAmount()
    return(res.status(200).json(result))
}
exports.totalDetail=async (req, res) => {
    let result=await userTotalDetails()
    return(res.status(200).json(result))
}
exports.totalBazar=async (req, res) => {
    let result=await totalBazarDetails(req)
    return(res.status(200).json(result))
}
exports.adminSignUp=async (req, res) => {
    let result= await AdminSignUpService(req)
    return(res.status(200).json(result))
}
exports.adminLogin=async (req, res) => {
    let result= await AdminLoginService(req)
    return(res.status(200).json(result))
}
exports.userTotalDetails=async (req, res) => {
    let result= await userTotalDetailsById(req)
    return(res.status(200).json(result))
}
exports.bazar=async (req, res) => {
    let result= await bazarFound()
    return(res.status(200).json(result))
}
exports.bazarBy=async (req, res) => {
    let result= await bazarFoundById(req)
    return(res.status(200).json(result))
}




