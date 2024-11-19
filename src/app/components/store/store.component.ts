import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { InventoryService } from "../../services/inventory.service"
import { CartService } from "../../services/cart.service"
import { HttpClient } from "@angular/common/http"
import { catchError } from "rxjs/operators"
import { of } from "rxjs"
import { Item } from "../../models/item.model"
import { ApiService } from "../../services/api.service"
import { AuthService } from "../../services/auth.service"
import { Router } from "@angular/router"
import { CartItem } from "../../models/cart.model"

@Component({
  selector: "app-store",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="row mb-3 align-items-center">
        <div class="col-md-6 mb-2 mb-md-0">
          <input
            type="text"
            class="form-control"
            placeholder="Search items..."
            [(ngModel)]="searchTerm"
            (ngModelChange)="filterItems()"
          />
        </div>

        <div class="col-md-3 mb-2 mb-md-0">
          <select
            class="form-select"
            [(ngModel)]="selectedCategory"
            (ngModelChange)="filterItems()"
          >
            <option value="">All Categories</option>
            <option *ngFor="let category of categories" [value]="category">
              {{ category }}
            </option>
          </select>
        </div>

        <div class="col-md-3">
          <select
            class="form-select"
            [(ngModel)]="sortOption"
            (ngModelChange)="sortItems()"
          >
            <option value="name">Sort by Name</option>
            <option value="priceLowHigh">Price: Low to High</option>
            <option value="priceHighLow">Price: High to Low</option>
            <option value="stock_level">Stock Level</option>
          </select>
        </div>
      </div>

      <div *ngIf="loading" class="text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div *ngIf="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <div *ngIf="!loading && !error" class="row row-cols-1 row-cols-md-4 g-4">
        <div *ngFor="let item of getInStockItems()" class="col">
          <div class="card h-100">
            <img
              [src]="item.image_url || 'https://placehold.co/600x400'"
              [style]="{ maxHeight: '300px' }"
              class="card-img-top"
              alt="Item Image"
            />
            <div class="card-body">
              <div
                class="d-flex flex-column justify-content-between align-items-start"
              >
                <h3 class="card-title">{{ item.name }}</h3>
                <p class="card-text mb-0">{{ item.description }}</p>
                <p class="card-text mb-0">Category: {{ item.category }}</p>
                <p class="card-text fw-bold mb-0">
                  {{ item.price.toFixed(2) }}
                </p>
                <span class="text-muted mb-1"
                  >Stock: {{ item.stock_level }}</span
                >
                <span class="d-flex items-center gap-2">
                  <span
                    *ngIf="getItemQuantityInCart(item) > 0"
                    class="badge bg-secondary"
                  >
                    {{ getItemQuantityInCart(item) }}
                  </span>
                  <button
                    class="btn btn-primary"
                    [disabled]="isAddToCartDisabled(item)"
                    (click)="addToCart(item)"
                  >
                    {{
                      isAddToCartDisabled(item) ? "Out of Stock" : "Add to Cart"
                    }}
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        *ngIf="!loading && !error && filteredItems.length === 0"
        class="alert alert-info"
      >
        No items match your search criteria.
      </div>
    </div>
  `,
})
export class StoreComponent implements OnInit {
  items: Item[] = []
  filteredItems: Item[] = []
  loading = true
  error: string | null = null
  cartItems: CartItem[] = []

  // Search and filter properties
  searchTerm = ""
  selectedCategory = ""
  categories: string[] = []

  // Sorting properties
  sortOption = "name"

  constructor(
    private http: HttpClient,
    private inventoryService: InventoryService,
    private cartService: CartService,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadItems()
    this.loadCartItems()
  }

  getInStockItems(): Item[] {
    return this.filteredItems.filter((item) => item.stock_level > 0)
  }

  loadCartItems() {
    const cartData = localStorage.getItem("cart")
    if (cartData) {
      const parsedCart = JSON.parse(cartData)
      this.cartItems = parsedCart.items || []
    }
  }

  getItemQuantityInCart(item: Item): number {
    const cartItem = this.cartItems.find((cartItem) => cartItem.id === item.id)
    return cartItem ? cartItem.quantity : 0
  }

  isAddToCartDisabled(item: Item): boolean {
    const currentQuantity = this.getItemQuantityInCart(item)
    return currentQuantity >= item.stock_level
  }

  loadItems() {
    this.loading = true
    this.error = null
    this.apiService
      .getItems()
      .pipe(
        catchError((err) => {
          console.error("Error loading store items:", err)
          this.error = "Failed to load store items. Please try again later."
          return of([])
        })
      )
      .subscribe((response: any) => {
        this.loading = false
        this.items = response.records.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: parseFloat(item.price),
          stock_level: parseInt(item.stock_level),
          category: item.category,
          image_url: item.image_url,
        }))

        // Extract unique categories
        this.categories = [
          ...new Set(this.items.map((item) => item.category ?? "")),
        ]

        // Initial filtering and sorting
        this.filterItems()
      })
  }

  filterItems() {
    this.filteredItems = this.items.filter(
      (item) =>
        // Filter by search term (case-insensitive)
        (this.searchTerm === "" ||
          item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          item.description
            ?.toLowerCase()
            .includes(this.searchTerm.toLowerCase())) &&
        // Filter by category
        (this.selectedCategory === "" ||
          item.category === this.selectedCategory)
    )

    // Apply sorting after filtering
    this.sortItems()
  }

  sortItems() {
    switch (this.sortOption) {
      case "name":
        this.filteredItems.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "priceLowHigh":
        this.filteredItems.sort((a, b) => a.price - b.price)
        break
      case "priceHighLow":
        this.filteredItems.sort((a, b) => b.price - a.price)
        break
      case "stock_level":
        this.filteredItems.sort((a, b) => b.stock_level - a.stock_level)
        break
    }
  }

  addToCart(item: Item) {
    if (!this.isAddToCartDisabled(item)) {
      if (!this.authService.isLoggedIn()) {
        // Store the intended item in session storage
        localStorage.setItem("intendedCartItem", JSON.stringify(item))

        // Redirect to login page
        this.router.navigate(["/"], {
          queryParams: {
            returnUrl: this.router.url,
            addToCart: "true",
          },
        })
        return
      } else {
        this.cartService.addToCart({ ...item, quantity: 1 } as CartItem)

        // Update local cart items
        this.loadCartItems()
      }
    }
  }
}
