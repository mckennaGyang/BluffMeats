import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { Item } from '../../models/item.model';

@Component({
  selector: 'app-item-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <h2 class="mb-4">Item Management</h2>
      <form (ngSubmit)="saveItem()" #itemForm="ngForm" class="mb-4">
        <div class="mb-3">
          <label for="name" class="form-label">Name</label>
          <input type="text" class="form-control" id="name" [(ngModel)]="currentItem.name" name="name" required>
        </div>
        <div class="mb-3">
          <label for="description" class="form-label">Description</label>
          <textarea class="form-control" id="description" [(ngModel)]="currentItem.description" name="description"></textarea>
        </div>
        <div class="mb-3">
          <label for="price" class="form-label">Price</label>
          <input type="number" class="form-control" id="price" [(ngModel)]="currentItem.price" name="price" required>
        </div>
        <div class="mb-3">
          <label for="stockLevel" class="form-label">Stock Level</label>
          <input type="number" class="form-control" id="stockLevel" [(ngModel)]="currentItem.stockLevel" name="stockLevel" required>
        </div>
        <button type="submit" class="btn btn-primary">Save Item</button>
      </form>

      <div class="table-responsive">
        <h3>Current Inventory</h3>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items">
              <td>{{item.name}}</td>
              <td>\${{item.price}}</td>
              <td>{{item.stockLevel}}</td>
              <td>
                <button class="btn btn-sm btn-secondary me-2" (click)="editItem(item)">Edit</button>
                <button class="btn btn-sm btn-danger" (click)="deleteItem(item.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ItemManagementComponent {
  items: Item[] = [];
  currentItem: Partial<Item> = {};

  constructor(private inventoryService: InventoryService) {
    this.loadItems();
  }

  loadItems() {
    this.inventoryService.getItems().subscribe(items => {
      this.items = items;
    });
  }

  saveItem() {
    if (this.currentItem.id) {
      this.inventoryService.updateItem(this.currentItem as Item).subscribe(() => {
        this.loadItems();
        this.resetForm();
      });
    } else {
      this.inventoryService.addItem({
        ...this.currentItem,
        id: Date.now().toString()
      } as Item).subscribe(() => {
        this.loadItems();
        this.resetForm();
      });
    }
  }

  editItem(item: Item) {
    this.currentItem = { ...item };
  }

  deleteItem(id: string) {
    this.inventoryService.deleteItem(id).subscribe(() => {
      this.loadItems();
    });
  }

  resetForm() {
    this.currentItem = {};
  }
}