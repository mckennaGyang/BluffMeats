import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router, ActivatedRoute } from "@angular/router"
import { CartService } from "../../services/cart.service"
import { AuthService } from "../../services/auth.service"
import { Cart } from "../../models/cart.model"
import { Item } from "../../models/item.model"

@Component({
  selector: "app-cart",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <h2>Shopping Cart</h2>
      <div *ngIf="cart.items.length === 0" class="alert alert-info">
        Your cart is empty
      </div>
      <div *ngIf="cart.items.length > 0">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of cart.items">
                <td>{{ item.name }}</td>
                <td>{{ item.price.toFixed(2) }}</td>
                <td>
                  <input
                    type="number"
                    class="form-control form-control-sm w-75"
                    [value]="item.quantity"
                    (change)="updateQuantity(item.id.toString(), $event)"
                    min="1"
                  />
                </td>
                <td>{{ (item.price * item.quantity).toFixed(2) }}</td>
                <td>
                  <button
                    class="btn btn-danger btn-sm"
                    (click)="removeItem(item.id.toString())"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-end fw-bold">Total:</td>
                <td colspan="2" class="fw-bold">{{ cart.total.toFixed(2) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-secondary" (click)="clearCart()">
            Clear Cart
          </button>
          <button class="btn btn-primary" (click)="checkout()">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  `,
})
export class CartComponent implements OnInit {
  cart: Cart = { items: [], total: 0 }

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      // Redirect to login if not authenticated
      this.router.navigate(["/login"], {
        queryParams: { returnUrl: this.router.url },
      })
      return
    }

    // Subscribe to cart changes
    this.cartService.getCart().subscribe((cart) => {
      this.cart = cart
    })

    // Check for intended cart items from session storage
    this.addIntendedCartItems()
  }

  addIntendedCartItems() {
    const intendedCartItem = sessionStorage.getItem("intendedCartItem")
    const intendedItem = JSON.parse(intendedCartItem || "null")
    if (intendedItem) {
      // Add the intended item to cart
      this.cartService.addToCart(intendedItem)

      // Clear the session storage
      sessionStorage.removeItem("intendedCartItem")
    }
  }

  updateQuantity(itemId: string, event: any) {
    const quantity = parseInt(event.target.value, 10)
    if (quantity > 0) {
      this.cartService.updateQuantity(itemId, quantity)
    }
  }

  removeItem(itemId: string) {
    this.cartService.removeFromCart(itemId)
  }

  clearCart() {
    this.cartService.clearCart()
  }

  checkout() {
    // Check if user is authenticated
    if (!this.authService.isLoggedIn()) {
      // Redirect to login with return URL
      this.router.navigate(["/login"], {
        queryParams: {
          returnUrl: this.router.url,
          checkout: "true",
        },
      })
      return
    }

    // Proceed with checkout logic
    this.router.navigate(["/checkout"])
  }
}
