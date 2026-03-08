import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { INews } from "./news.interface";
import { NewsService } from "./news.service";

const createNews = catchAsync(async (req: Request, res: Response) => {
  const payload: INews = {
    ...req.body,
    picture: req.file?.path,
  };

  // const payload = req.body;
  const result = await NewsService.createNews(payload);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "News created successfully",
    data: result,
  });
});

const updateNews = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const payload: INews = {
    ...req.body,
    picture: req.file?.path,
  };
  const result = await NewsService.updateNews(id, payload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "News updated successfully",
    data: result,
  });
});

const getAllNewss = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await NewsService.getAllNewss(query as Record<string, string>);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Newss retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleNews = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await NewsService.getSingleNews(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "News retrieved successfully",
    data: result,
  });
});

const deleteNews = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await NewsService.deleteNews(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "News deleted successfully",
    data: result,
  });
});

export const NewsController = {
  createNews,
  getAllNewss,
  getSingleNews,
  updateNews,
  deleteNews,
};
