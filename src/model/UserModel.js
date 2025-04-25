const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    total_paid_amount: { type: Number, default: 0 },
    total_meal: { type: Number, default: 0 },
    meal_history: [
        {
            meal_date: { type: Date, default: Date.now },
            meal_status: { type: String, enum: ["Taken", "Pending"], default: "Pending" },
            meal_count: { type: Number, default: 0 },
        }
    ]
}, { timestamps: true, versionKey: false });

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
