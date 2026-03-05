import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ProductService } from "./product.service";
import { IProduct } from "./product.interface";

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const payload: IProduct = {
    ...req.body,
    picture: req.file?.path,
    // images: (req.files as Express.Multer.File[]).map((file) => file.path),
  };

  // const payload = req.body;
  const result = await ProductService.createProduct(payload);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Product created successfully",
    data: result,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const payload: IProduct = {
    ...req.body,
    picture: req.file?.path,
  };
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
