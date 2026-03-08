import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { INews } from "./news.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";
import { newsSearchableFields } from "./news.constant";
import { News } from "./news.model";

const createNews = async (payload: INews) => {
  const exsitingNews = await News.findOne({ name: payload.name });

  if (exsitingNews) {
    throw new AppError(httpStatus.CONFLICT, "News with this name already exists");
  }

  const news = await News.create(payload);
  return news;
};

const updateNews = async (id: string, payload: Partial<INews>) => {
  const existingNews = await News.findById(id);

  const existingNewsName = await News.findOne({ name: payload.name });

  if (!existingNews) {
    throw new Error("News not found.");
  }

  if (existingNewsName) {
    throw new AppError(httpStatus.CONFLICT, "News with this name already exists");
  }

  const duplicateProject = await News.findOne({
    name: payload.name,
  });

  if (duplicateProject) {
    throw new Error("A News with this name already exists.");
  }

  //

  const updatedProject = await News.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

  if (payload.picture && existingNews.picture) {
    await deleteImageFromCLoudinary(existingNews.picture);
  }

  return updatedProject;
};

const getAllNewss = async (query: Record<string, string>) => {
  const NewsQuery = new QueryBuilder(News.find(), query).search(newsSearchableFields).filter().sort().fields().paginate();

  // const meta = await queryBuilder.getMeta()

  const data = await NewsQuery.modelQuery;
  const meta = await NewsQuery.countTotal();
  return {
    data,
    meta,
  };
};

const getSingleNews = async (id: string) => {
  const news = await News.findById(id);
  return {
    data: news,
  };
};

const deleteNews = async (id: string) => {
  return await News.findByIdAndDelete(id);
};

export const NewsService = {
  createNews,
  updateNews,
  getAllNewss,
  getSingleNews,
  deleteNews,
};
