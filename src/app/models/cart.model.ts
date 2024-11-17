import { Item } from "./item.model";

export interface CartItem extends Item {
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}