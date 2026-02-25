"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const project_model_1 = require("./project.model");
const cloudinary_config_1 = require("../../config/cloudinary.config");
const project_constant_1 = require("./project.constant");
const createProject = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingProjectName = yield project_model_1.Project.findOne({ name: payload.name });
    // const existingProjecttitle = await Project.findOne({ title: payload.title });
    if (existingProjectName) {
        throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "Project with this name already exists");
    }
    // if (existingProjecttitle) {
    //   throw new AppError(httpStatus.CONFLICT, "Project with this title already exists");
    // }
    const project = yield project_model_1.Project.create(payload);
    return project;
});
const updateProject = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingProject = yield project_model_1.Project.findById(id);
    const existingProjectName = yield project_model_1.Project.findOne({ name: payload.name });
    const existingProjecttitle = yield project_model_1.Project.findOne({ title: payload.title });
    if (!existingProject) {
        throw new Error("Project not found.");
    }
    if (existingProjectName) {
        throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "Project with this name already exists");
    }
    if (existingProjecttitle) {
        throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "Project with this title already exists");
    }
    const duplicateProject = yield project_model_1.Project.findOne({
        name: payload.name,
    });
    if (duplicateProject) {
        throw new Error("A Project with this name already exists.");
    }
    //
    const updatedProject = yield project_model_1.Project.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (payload.picture && existingProject.picture) {
        yield (0, cloudinary_config_1.deleteImageFromCLoudinary)(existingProject.picture);
    }
    return updatedProject;
});
const getAllProjects = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(project_model_1.Project.find().populate("client"), query);
    const projects = yield queryBuilder.search(project_constant_1.projectSearchableFields).filter().sort().fields().paginate();
    // const meta = await queryBuilder.getMeta()
    const [data, meta] = yield Promise.all([projects.build(), queryBuilder.getMeta()]);
    return {
        data,
        meta,
    };
});
const getSingleProject = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const project = yield project_model_1.Project.findById(id);
    return {
        data: project,
    };
});
const deleteProject = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield project_model_1.Project.findByIdAndDelete(id);
});
exports.ProjectService = {
    createProject,
    updateProject,
    getAllProjects,
    getSingleProject,
    deleteProject,
};
