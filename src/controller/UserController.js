 const{createUserProfileService,userLoginService,userFindById,Datareset}=require('../Service/UserService.js');

 exports.createUserProfile=async (req, res) => {
    let result=await createUserProfileService(req)
    return(res.status(200).json(result))
}
exports.userLogin=async (req, res) => {
     let result=await userLoginService(req)
    return(res.status(200).json(result))
}
 exports.userById=async (req, res) => {
     let result=await userFindById(req)
     return(res.status(200).json(result))
 }
 exports.resetData=async (req, res) => {
     let result=await Datareset(req)
     return(res.status(200).json(result))
 }