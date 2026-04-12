export type TUpdateProductPayload = Partial<IProduct> & {
  removeGallery?: string[];
};

export interface IProduct {
  name: string;
  description: string;
  location: string;
  price: number;
  quantity: number;
  picture?: string;
  gallery?: string[];
}
