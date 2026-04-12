import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ProductService } from "./product.service";
import { IProduct } from "./product.interface";
import { IProject } from "../project/project.interface";

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as {
    picture?: Express.Multer.File[];
    gallery?: Express.Multer.File[];
  };

  const payload: Partial<IProject> = {
    ...req.body,
    picture: files?.picture?.[0]?.path,
    gallery: files?.gallery?.map((file) => file.path) || [],
  };

  // const payload = req.body;
  const result = await ProductService.createProduct(payload as IProduct);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Product created successfully",
    data: result,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const files = req.files as {
    picture?: Express.Multer.File[];
    gallery?: Express.Multer.File[];
  };

  const payload: Partial<IProject> & { removeGallery?: string[] } = {
    ...req.body,
  };

  if (files?.picture?.[0]?.path) {
    payload.picture = files.picture[0].path;
  }

  if (files?.gallery?.length) {
    payload.gallery = files.gallery.map((file) => file.path);
  }

  if (req.body.removeGallery) {
    payload.removeGallery = JSON.parse(req.body.removeGallery);
  }

  const result = await ProductService.updateProduct(id, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product updated successfully",
    data: result,
  });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await ProductService.getAllProducts(query as Record<string, string>);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Products retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await ProductService.getSingleProduct(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await ProductService.deleteProduct(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product deleted successfully",
    data: result,
  });
});

export const ProductController = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
