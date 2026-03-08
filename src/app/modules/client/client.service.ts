import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IClient } from "./client.interface";
import { Client } from "./client.model";
import { clientSearchableFields } from "./client.constant";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";

const createClient = async (payload: IClient) => {
  const exsitingClient = await Client.findOne({ name: payload.name });

  if (exsitingClient) {
    throw new AppError(httpStatus.CONFLICT, "Client with this name already exists");
  }

  const client = await Client.create(payload);
  return client;
};

const updateClient = async (id: string, payload: Partial<IClient>) => {
  const existingClient = await Client.findById(id);

  if (!existingClient) {
    throw new Error("Client not found.");
  }

  const duplicateClient = await Client.findOne({
    name: payload.name,
  });

  if (duplicateClient) {
    throw new Error("A Client with this name already exists.");
  }

  //

  const updatedClient = await Client.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

  if (payload.picture && existingClient.picture) {
    await deleteImageFromCLoudinary(existingClient.picture);
  }

  return updatedClient;
};

const getAllClients = async (query: Record<string, string>) => {
  const ClientQuery = new QueryBuilder(Client.find(), query).search(clientSearchableFields).filter().sort().fields().paginate();

  // const meta = await queryBuilder.getMeta()

  const data = await ClientQuery.modelQuery;
  const meta = await ClientQuery.countTotal();
  return {
    data,
    meta,
  };
};

const getSingleClient = async (id: string) => {
  const client = await Client.findById(id);
  return {
    data: client,
  };
};

const deleteClient = async (id: string) => {
  return await Client.findByIdAndDelete(id);
};

export const ClientService = {
  createClient,
  updateClient,
  getAllClients,
  getSingleClient,
  deleteClient,
};
