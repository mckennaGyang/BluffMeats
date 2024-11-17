export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  stockLevel: number;
  category: string;
  imageUrl?: string;
}