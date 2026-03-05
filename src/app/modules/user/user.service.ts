import { envVars } from "../../config/env";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import { JwtPayload } from "jsonwebtoken";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constant";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
  }

  const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND));

  const authProvider: IAuthProvider = { provider: "credentials", providerId: email as string };

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });

  return user;
};

const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
  const ifUserExist = await User.findById(userId);

  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  if (payload.role) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.EMPLOYEE) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }

    if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.EMPLOYEE) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  if (payload.password) {
    payload.password = await bcryptjs.hash(payload.password, envVars.BCRYPT_SALT_ROUND);
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });

  return newUpdatedUser;
};

const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);
  const usersData = queryBuilder.filter().search(userSearchableFields).sort().fields().paginate();

  const data = await usersData.modelQuery;
  const meta = await usersData.countTotal();

  return {
    data,
    meta,
  };
};

const getSingleUser = async (id: string) => {
  const user = await User.findById(id).select("-password");
  return {
    data: user,
  };
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  return {
    data: user,
  };
};

const deleteUser = async (id: string) => {
  const result = await User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  return result;
};

export const UserServices = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  getMe,
};
