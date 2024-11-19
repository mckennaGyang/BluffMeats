import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable } from "rxjs"
import { Cart, CartItem } from "../models/cart.model"
import { Item } from "../models/item.model"

@Injectable({
  providedIn: "root",
})
export class CartService {
  private cart: Cart = { items: [], total: 0 }
  private cartSubject = new BehaviorSubject<Cart>(this.cart)

  constructor() {
    // Initialize cart from localStorage on service creation
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      this.cartSubject.next(JSON.parse(savedCart))
    }
  }

  getCurrentCart(): Cart {
    return this.cartSubject.value
  }

  getCart(): Observable<Cart> {
    return this.cartSubject.asObservable()
  }

  addToCart(item: CartItem): void {
    const currentCart = this.getCurrentCart()
    const existingItemIndex = currentCart.items.findIndex(
      (i) => i.id === item.id
    )

    if (existingItemIndex > -1) {
      // Item exists, increment quantity
      currentCart.items[existingItemIndex].quantity += item.quantity
    } else {
      // New item, add to cart
      currentCart.items.push(item)
    }

    // Recalculate total
    this.calculateTotal(currentCart)

    // Update cart and save to localStorage
    this.updateCart(currentCart)
  }

  updateQuantity(itemId: string, quantity: number) {
    const currentCart = this.getCurrentCart()
    const itemIndex = currentCart.items.findIndex(
      (i) => i.id.toString() === itemId
    )

    if (itemIndex > -1) {
      // Ensure quantity is at least 1
      currentCart.items[itemIndex].quantity = Math.max(1, quantity)

      // Recalculate total
      this.calculateTotal(currentCart)

      // Update cart
      this.updateCart(currentCart)
    }
  }

  private updateTotal(): void {
    this.cart.total = this.cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    this.cartSubject.next({ ...this.cart })
  }

  removeFromCart(itemId: string) {
    const currentCart = this.getCurrentCart()
    currentCart.items = currentCart.items.filter(
      (item) => item.id.toString() !== itemId
    )

    // Recalculate total
    this.calculateTotal(currentCart)

    // Update cart
    this.updateCart(currentCart)
  }

  // Clear entire cart
  clearCart() {
    const emptyCart: Cart = { items: [], total: 0 }
    this.updateCart(emptyCart)
  }

  private calculateTotal(cart: Cart) {
    cart.total = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  }

  // Private method to update cart and persist to localStorage
  private updateCart(cart: Cart) {
    // Update BehaviorSubject
    this.cartSubject.next(cart)

    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(cart))
  }
}
