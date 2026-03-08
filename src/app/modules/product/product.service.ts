import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IProduct } from "./product.interface";
import { Product } from "./product.model";
import { productSearchableFields } from "./product.constant";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";

const createProduct = async (payload: IProduct) => {
  const exsitingProduct = await Product.findOne({ name: payload.name });

  if (exsitingProduct) {
    throw new AppError(httpStatus.CONFLICT, "Product with this name already exists");
  }

  const product = await Product.create(payload);
  return product;
};

const updateProduct = async (id: string, payload: Partial<IProduct>) => {
  const existingProduct = await Product.findById(id);

  if (!existingProduct) {
    throw new Error("Product not found.");
  }

  const duplicateProduct = await Product.findOne({
    name: payload.name,
  });

  if (duplicateProduct) {
    throw new Error("A Product with this name already exists.");
  }

  //

  const updatedProduct = await Product.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

  if (payload.picture && existingProduct.picture) {
    await deleteImageFromCLoudinary(existingProduct.picture);
  }

  return updatedProduct;
};

const getAllProducts = async (query: Record<string, string>) => {
  const productQuery = new QueryBuilder(Product.find(), query).search(productSearchableFields).filter().sort().fields().paginate();

  // const meta = await queryBuilder.getMeta()

  const data = await productQuery.modelQuery;
  const meta = await productQuery.countTotal();
  return {
    data,
    meta,
  };
};

const getSingleProduct = async (id: string) => {
  const product = await Product.findById(id);
  return {
    data: product,
  };
};

const deleteProduct = async (id: string) => {
  return await Product.findByIdAndDelete(id);
};

export const ProductService = {
  createProduct,
  updateProduct,
  getAllProducts,
  getSingleProduct,
  deleteProduct,
};
