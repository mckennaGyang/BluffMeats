import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cart, CartItem } from '../models/cart.model';
import { Item } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: Cart = { items: [], total: 0 };
  private cartSubject = new BehaviorSubject<Cart>(this.cart);

  getCart(): Observable<Cart> {
    return this.cartSubject.asObservable();
  }

  addToCart(item: Item): void {
    const existingItem = this.cart.items.find(i => i.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.items.push({ ...item, quantity: 1 });
    }
    
    this.updateTotal();
  }

  removeFromCart(itemId: string): void {
    this.cart.items = this.cart.items.filter(item => item.id !== itemId);
    this.updateTotal();
  }

  updateQuantity(itemId: string, quantity: number): void {
    const item = this.cart.items.find(i => i.id === itemId);
    if (item) {
      item.quantity = quantity;
      this.updateTotal();
    }
  }

  private updateTotal(): void {
    this.cart.total = this.cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    this.cartSubject.next({ ...this.cart });
  }

  clearCart(): void {
    this.cart = { items: [], total: 0 };
    this.cartSubject.next(this.cart);
  }
}