import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"

import { CartService } from "../../services/cart.service"
import { ApiService } from "../../services/api.service"
import { AuthService } from "../../services/auth.service"

import { Cart } from "../../models/cart.model"
import { Item } from "../../models/item.model"
import { ToastrService } from "ngx-toastr"

@Component({
  selector: "app-checkout",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <h2 class="mb-4">Checkout</h2>

      <!-- Order Summary -->
      <div class="row">
        <div class="col-md-8">
          <div class="card mb-4">
            <div class="card-header">Order Summary</div>
            <div class="card-body">
              <table class="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of cart.items">
                    <td>{{ item.name }}</td>
                    <td>R{{ item.price.toFixed(2) }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>R{{ (item.price * item.quantity).toFixed(2) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" class="text-end fw-bold">Total:</td>
                    <td class="fw-bold">{{ cart.total.toFixed(2) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Shipping Information Form -->
          <div class="card">
            <div class="card-header">Shipping Information</div>
            <div class="card-body">
              <form (ngSubmit)="processOrder()">
                <div class="mb-3">
                  <label for="fullName" class="form-label">Full Name</label>
                  <input
                    type="text"
                    class="form-control"
                    id="fullName"
                    [(ngModel)]="shippingInfo.fullName"
                    name="fullName"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label for="address" class="form-label">Address</label>
                  <input
                    type="text"
                    class="form-control"
                    id="address"
                    [(ngModel)]="shippingInfo.address"
                    name="address"
                    required
                  />
                </div>
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label for="city" class="form-label">City</label>
                    <input
                      type="text"
                      class="form-control"
                      id="city"
                      [(ngModel)]="shippingInfo.city"
                      name="city"
                      required
                    />
                  </div>
                  <div class="col-md-4 mb-3">
                    <label for="state" class="form-label">State</label>
                    <input
                      type="text"
                      class="form-control"
                      id="state"
                      [(ngModel)]="shippingInfo.state"
                      name="state"
                      required
                    />
                  </div>
                  <div class="col-md-4 mb-3">
                    <label for="zipCode" class="form-label">Zip Code</label>
                    <input
                      type="text"
                      class="form-control"
                      id="zipCode"
                      [(ngModel)]="shippingInfo.zipCode"
                      name="zipCode"
                      required
                    />
                  </div>
                </div>

                <!-- Payment Method -->
                <div class="mb-3">
                  <label class="form-label">Payment Method</label>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="creditCard"
                      [(ngModel)]="paymentMethod"
                      value="creditCard"
                      required
                    />
                    <label class="form-check-label" for="creditCard">
                      Credit Card
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="paypal"
                      [(ngModel)]="paymentMethod"
                      value="paypal"
                    />
                    <label class="form-check-label" for="paypal">
                      PayPal
                    </label>
                  </div>
                </div>

                <!-- Submit Order Button -->
                <button
                  type="submit"
                  class="btn btn-primary w-100"
                  [disabled]="!isFormValid()"
                >
                  Complete Order
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Order Details Sidebar -->
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">Order Details</div>
            <div class="card-body">
              <p>Subtotal: R{{ cart.total.toFixed(2) }}</p>
              <p>Shipping: R200.00</p>
              <p>VAT (18%): R{{ (cart.total * 0.18).toFixed(2) }}</p>
              <hr />
              <p class="fw-bold">
                Total: R{{ (cart.total + 200 + cart.total * 0.18).toFixed(2) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CheckoutComponent implements OnInit {
  cart: Cart = { items: [], total: 0 }

  // Shipping Information Model
  shippingInfo = {
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  }

  // Payment Method
  paymentMethod: string = ""

  constructor(
    private cartService: CartService,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    // Ensure user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(["/login"], {
        queryParams: { returnUrl: this.router.url },
      })
      return
    }

    // Get current cart
    this.cartService.getCart().subscribe((cart) => {
      this.cart = cart
    })
  }

  // Validate form before submission
  isFormValid(): boolean {
    return !!(
      this.shippingInfo.fullName &&
      this.shippingInfo.address &&
      this.shippingInfo.city &&
      this.shippingInfo.state &&
      this.shippingInfo.zipCode &&
      this.paymentMethod
    )
  }

  // Process the order
  processOrder() {
    if (!this.isFormValid()) {
      return
    }

    // Create order object
    const order: Order = {
      items: this.cart.items,
      total: this.cart.total,
      shippingInfo: this.shippingInfo,
      paymentMethod: this.paymentMethod,
      date: new Date(),
    }

    // Update item quantities
    this.updateItemQuantities()

    console.log("Order processed:", order)
    //TODO Add API call to process order

    // Clear cart after successful order
    this.cartService.clearCart()
    this.apiService.getItems()
    // Navigate to order confirmation page
    this.router.navigate(["/store"])
    this.toastr.success("Payment successful!", "Checkout")
  }

  // Update item quantities in the inventory
  private updateItemQuantities() {
    this.cart.items.forEach((cartItem) => {
      // Find the corresponding item in the inventory and update its quantit
      console.log({
        ...cartItem,
        stock_level: cartItem.stock_level - cartItem.quantity,
      } as Item)
      this.apiService
        .updateItem({
          ...cartItem,
          stock_level: cartItem.stock_level - cartItem.quantity,
        } as Item)
        .subscribe({
          next: () => {
            console.log(`Updated quantity for item ${cartItem.id}`)
          },
          error: (error) => {
            console.error(
              `Failed to update quantity for item ${cartItem.id}:`,
              error
            )
          },
        })
    })
  }
}

// models/order.model.ts
interface Order {
  items: Item[]
  total: number
  shippingInfo: {
    fullName: string
    address: string
    city: string
    state: string
    zipCode: string
  }
  paymentMethod: string
  date: Date
}
