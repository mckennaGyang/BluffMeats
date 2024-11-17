import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../services/inventory.service';
import { CartService } from '../../services/cart.service';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Item } from '../../models/item.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: "app-store",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <h2 class="mb-4">Online Store</h2>
      <div *ngIf="loading" class="text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div *ngIf="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>
      <div *ngIf="!loading && !error" class="row row-cols-1 row-cols-md-3 g-4">
        <div *ngFor="let item of items" class="col">
          <div class="card h-100">
            <img [src]="item.imageUrl" class="card-img-top" alt="Item Image" />
            <div class="card-body">
            <h3 class="card-title">{{ item.name }}</h3>
              <p class="card-text">{{ item.description }}</p>
              <p class="card-text">Category: {{ item.category }}</p>
              <p class="card-text fw-bold"> {{ item.price }}</p>  
            <div class="d-flex justify-content-between align-items-center">
                <span class="text-muted">Stock: {{ item.stockLevel }}</span>
                <button
                  class="btn btn-primary"
                  [disabled]="item.stockLevel === 0"
                  (click)="addToCart(item)"
                >
                  {{ item.stockLevel === 0 ? "Out of Stock" : "Add to Cart" }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        *ngIf="!loading && !error && items.length === 0"
        class="alert alert-info"
      >
        No items available in the store.
      </div>
    </div>
  `,
})
export class StoreComponent implements OnInit {
  items: Item[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private inventoryService: InventoryService,
    private cartService: CartService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.loading = true;
    this.error = null;

    this.apiService
      .getItems()
      .pipe(
        catchError((err) => {
          console.error("Error loading store items:", err);
          this.error = "Failed to load store items. Please try again later.";
          return of([]);
        })
      )
      .subscribe((response: any) => {
        this.loading = false;
        console.log(response);
          this.items = response.records.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: parseFloat(item.price),
            stockLevel: parseInt(item.stock_level),
            category: item.category,
            imageUrl: item.image_url
          }));
      });
  }

  addToCart(item: Item) {
    if (item.stockLevel > 0) {
      this.cartService.addToCart(item);
      this.loadItems();
    }
  }
}