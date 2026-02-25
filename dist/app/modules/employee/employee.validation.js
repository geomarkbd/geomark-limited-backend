"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEmployeeZodSchema = exports.createEmployeeZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createEmployeeZodSchema = zod_1.default.object({
    name: zod_1.default.string({ invalid_type_error: "Email must be string" }),
    email: zod_1.default.string({ invalid_type_error: "Email must be string" }).email({ message: "Invalid email address format." }),
    phone: zod_1.default.string({ invalid_type_error: "Phone is required" }),
    address: zod_1.default.string().optional(),
    designation: zod_1.default.string({ invalid_type_error: "Designation is required" }),
    facebook: zod_1.default.string().optional(),
    linkedin: zod_1.default.string().optional(),
    twitter: zod_1.default.string().optional(),
    picture: zod_1.default.string().optional(),
    joinDate: zod_1.default.string().optional(),
});
exports.updateEmployeeZodSchema = zod_1.default.object({
    name: zod_1.default.string().min(1).optional(),
    email: zod_1.default.string().email().optional(),
    phone: zod_1.default.string().optional(),
    address: zod_1.default.string().optional(),
    designation: zod_1.default.string().optional(),
    facebook: zod_1.default.string().optional(),
    linkedin: zod_1.default.string().optional(),
    twitter: zod_1.default.string().optional(),
    picture: zod_1.default.string().optional(),
    joinDate: zod_1.default.string().optional(),
});
