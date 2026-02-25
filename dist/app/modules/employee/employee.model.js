"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Employee = void 0;
const mongoose_1 = require("mongoose");
const employeeSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String },
    designation: { type: String, required: true },
    picture: { type: String },
    facebook: { type: String },
    linkedin: { type: String },
    twitter: { type: String },
    joinDate: { type: Date },
}, {
    timestamps: true,
});
exports.Employee = (0, mongoose_1.model)("Employee", employeeSchema);
