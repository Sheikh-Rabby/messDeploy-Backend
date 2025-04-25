const UserModel = require('../model/UserModel');
const BazarModel = require('../model/BazarModel');
 const mongoose=require('mongoose')

const updateMealService = async (req, res) => {
    const {userId, mealStatus, mealDate, meal_count} = req.body;
    try {

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({status: "fail", message: "User not found"});
        }


        const existingMeal = user.meal_history.find(meal => {

            if (meal.meal_date && meal.meal_date instanceof Date) {
                return meal.meal_date.toISOString().split('T')[0] === mealDate;
            }
            return false;
        });

        if (existingMeal) {
            return {status: "fail", message: "Meal entry already exists for this date"};
        } else {
            user.meal_history.push({meal_date: mealDate, meal_status: mealStatus, meal_count});
        }

        if (mealStatus === "Taken") {
            user.total_meal += meal_count;
        }


        await user.save();

        return {status: "success", message: "Meal updated successfully"};

    } catch (err) {
        return {status: "fail", message: err.message};
    }

}

    const UpdatePaidAmount = async (req, res) => {
        const {userId, total_paid_amount} = req.body;
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                return {status: "fail", message: "User not found"};
            }

            user.total_paid_amount += total_paid_amount;
            await user.save();
            return {status: "success", message: "Paid amount updated successfully"};

        } catch (err) {
            return {status: "fail", message: err.message};

        }

    }
const findUserService = async (req, res) => {
    try {
        let data = await UserModel.find();
        return {status: "success", data: data};
    } catch (err) {
        return {status: "fail", message: err.message};
    }
}
const calculateTotalPaidAmount = async (req, res) => {
    try {

        const result = await UserModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalPaidAmount: { $sum: "$total_paid_amount" },
                    totalMeal: { $sum: "$total_meal" }
                }
            },
            {
                $project: {
                    totalPaidAmount: 1,
                    totalMeal: 1,


                }
            }
        ]);


        const totalBazar = await BazarModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" }
                }
            }

        ]);

        const totalMeal = result[0].totalMeal;
        const totalPaidAmount = result[0].totalPaidAmount;
        const totalBazarAmount = totalBazar[0] ? totalBazar[0].totalAmount : 0;
        const mealRate = totalMeal > 0 ? Math.round((totalBazarAmount / totalMeal) * 100) / 100 : 0;
        const totalMealCost = totalMeal * mealRate;
        const totalRefoundCost= Math.abs(totalBazarAmount - totalPaidAmount);


        // Data to return to the frontend
        const data = {
            totalPaidAmount,
            totalMeal,
            mealRate,
            totalMealCost,
            totalBazarAmount,
            totalRefoundCost
        };

        return { status: "success", data: data };

    } catch (err) {
        return { status: "fail", message: err.message };
    }
};


const userTotalDetails = async (req, res) => {
    try {

        const result = await UserModel.aggregate([

            {
                $group: {
                    _id: null,
                    totalPaidAmount: { $sum: "$total_paid_amount" },
                    totalMeal: { $sum: "$total_meal" },

                }
            },
            {
                $project: {
                    _id: 1,
                    totalPaidAmount: 1,
                    totalMeal: 1,


                }
            }
        ]);

        const totalBazar = await BazarModel.aggregate([
            {
                $group: {
                    _id: null,
                    bazarAmount: { $sum: "$amount" },
                }
            }
            ])



        const totalMeal = result[0].totalMeal;
        const bazar = totalBazar[0].bazarAmount;
        const mealRate = bazar / totalMeal;



        const usersMealCost = await UserModel.aggregate([

            {
                $lookup: {
                    from: "bazars",
                    pipeline: [
                        {
                            $group: {
                                _id: null,
                                bazar: { $sum: "$amount" },
                            }
                        },
                    ],
                    as: "bazarInfo"
                }
            },
            {
                $unwind: {
                    path: "$bazarInfo",
                    preserveNullAndEmptyArrays: true

                }
            },




            {

            $addFields: {
                mealRate: mealRate,
                totalMealCost: { $multiply: ["$total_meal", mealRate] },
                totalPaidAmount:"$total_paid_amount",
                totalMeal:"$total_meal",

            }
        },

            {
                $addFields: {
                    giveTk: {$round: [{ $subtract: ["$total_paid_amount", "$totalMealCost"] }, 2]},
                    giveTKMessage:{
                        $cond:{
                            if:{$lt:[{$round: [{ $subtract: ["$total_paid_amount", "$totalMealCost"] }, 2]},0]},
                            then:{
                                $concat: ["তুমি ", { $toString: { $abs:{$round: [{ $subtract: ["$total_paid_amount", "$totalMealCost"] }, 2] } } }, " টাকা দিবে"]
                            },
                            else:{
                                $concat: ["তুমি ", { $toString: { $abs:{$round: [{ $subtract: ["$total_paid_amount", "$totalMealCost"] }, 2] } } }, " টাকা পাবে"]

                            }
                        }
                    },
                    waringMessage:{
                        $cond:{
                            if:{$lt:["$total_paid_amount",2000]},
                            then:"তোমার উচিত ২০০০ টাকা দেওয়া।",
                            else:"ধন্যবাদ!তুমি ২০০০ টাকা দিয়ে দিয়েছো"
                        }
                    },
                    totalBazarAmount: bazar
                }
            },

            {
                $project: {
                    _id: 1,
                    name: 1,
                    totalPaidAmount: 1,
                    waringMessage:1,
                    totalMeal: 1,
                    mealRate: 1,
                    totalMealCost: 1,
                    giveTk:1,
                    giveTKMessage:1,
                    totalBazarAmount:1
                }
            }
        ]);



        return { status: "success", data: usersMealCost };

    } catch (err) {
        return { status: "fail", message: err.message };
    }
}

const totalBazarDetails = async (req, res) => {
     try{
         let reqBody=req.body;
         let data=await BazarModel.create(reqBody);
         return {status: "success", data: data};
     }catch(err){
         return {status: "fail", message: err.message};
     }

}
const userTotalDetailsById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id)// Getting userId from request params

        // Check if user exists
        const userExists = await UserModel.findById(id);  // Find user by ID

        if (!userExists) {
            return{ status: "fail", message: "User not found" };
        }

        // Proceed with aggregation if user exists
        const result = await UserModel.aggregate([

            {
                $group: {
                    _id: null,
                    totalPaidAmount: { $sum: "$total_paid_amount" },
                    totalMeal: { $sum: "$total_meal" },
                }
            },
            {
                $project: {
                    _id: 0,
                    totalPaidAmount: 1,
                    totalMeal: 1,
                }
            }
        ]);

        const totalBazar = await BazarModel.aggregate([
            {
                $group: {
                    _id: null,
                    bazarAmount: { $sum: "$amount" },
                }
            }
        ]);

        const totalMeal = result[0].totalMeal;
        const bazar = totalBazar[0].bazarAmount;
        const mealRate = bazar / totalMeal;

        const userMealCost = await UserModel.aggregate([

            {
                $lookup: {
                    from: "bazars",
                    pipeline: [
                        {
                            $group: {
                                _id: null,
                                bazar: { $sum: "$amount" },
                            }
                        },
                    ],
                    as: "bazarInfo"
                }
            },
            {
                $unwind: {
                    path: "$bazarInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: { _id: new mongoose.Types.ObjectId(id) } // Match the specific user
            },

            {
                $addFields: {
                    mealRate: {$round:[mealRate,2]},
                    totalMealCost: { $round: [{ $multiply: ["$total_meal", mealRate] }, 2] },
                    totalPaidAmount: "$total_paid_amount",
                    totalMeal: "$total_meal",
                }
            },
            {
                $addFields: {
                    giveTk: {$round:[ { $subtract: ["$total_paid_amount", "$totalMealCost"] },]},
                    giveTKMessage: {
                        $cond: {
                            if: { $lt: [{ $subtract: ["$total_paid_amount", "$totalMealCost"] }, 0] },
                            then: { $concat: ["তুমি ", { $toString: { $abs: { $subtract: ["$totalPaidAmount", "$totalMealCost"] } } }, " টাকা দিবে"] },
                            else: { $concat: ["তুমি ", { $toString: { $abs: { $subtract: ["$totalPaidAmount", "$totalMealCost"] } } }, " টাকা পাবে"] }
                        }
                    },
                    waringMessage: {
                        $cond: {
                            if: { $lt: ["$total_paid_amount", 2000] },
                            then: "তোমার উচিত ২০০০ টাকা দেওয়া।",
                            else: "ধন্যবাদ!তুমি ২০০০ টাকা দিয়ে দিয়েছো"
                        }
                    },
                    totalBazarAmount: bazar
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    totalPaidAmount: 1,
                    waringMessage: 1,
                    totalMeal: 1,
                    mealRate: 1,
                    totalMealCost: 1,
                    giveTk: 1,
                    giveTKMessage: 1,
                    totalBazarAmount: 1
                }
            }
        ]);

        return {status: "success", data: userMealCost };

    } catch (err) {
        return{ status: "fail", message: err.message };
    }
};


const bazarFound = async () => {
    try {
        let response = await BazarModel.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "buyer",
                    foreignField: "_id",
                    as: "buyerDetails"
                }
            },
            {
                $unwind: "$buyerDetails"
            },
            {
                $project: {
                    _id: 1,
                    date: 1,
                    amount: 1,
                    details: 1,
                    buyer: 1,
                    buyerName: "$buyerDetails.name"
                }
            }
        ]);

        return { status: "success", data: response };
    } catch (err) {
        return { status: "fail", message: err.message };
    }
};

const bazarFoundById = async (req) => {
    const { buyerID } = req.params;
    try {
        let response = await BazarModel.aggregate([
            {
                $match: { buyer: new mongoose.Types.ObjectId(buyerID) }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "buyer",
                    foreignField: "_id",
                    as: "buyerDetails"
                }
            },
            {
                $unwind: "$buyerDetails"
            },
            {
                $project: {
                    _id: 1,
                    date: 1,
                    amount: 1,
                    details: 1,
                    buyer: 1,
                    buyerName: "$buyerDetails.name"
                }
            }
        ]);

        return { status: "success", data: response };
    } catch (err) {
        return { status: "fail", message: err.message };
    }
};







module.exports ={updateMealService,UpdatePaidAmount,findUserService,calculateTotalPaidAmount,userTotalDetails,totalBazarDetails,userTotalDetailsById,bazarFound,bazarFoundById};
