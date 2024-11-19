import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, NgForm } from "@angular/forms"
import { ToastrService } from "ngx-toastr"
import { ApiService } from "../../services/api.service"
import { Item } from "../../models/item.model"

// Define the interface to match the API response

@Component({
  selector: "app-item-management",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <h2 class="mb-4">Item Management</h2>

      <div *ngIf="isEditMode" class="card mb-4">
        <div class="card-header">
          {{ currentItem.id ? "Edit Item" : "Add New Item" }}
        </div>
        <div class="card-body">
          <form (ngSubmit)="saveItem(itemForm)" #itemForm="ngForm">
            <div class="mb-3">
              <label for="name" class="form-label">Name</label>
              <input
                type="text"
                class="form-control"
                id="name"
                [(ngModel)]="currentItem.name"
                name="name"
                required
              />
            </div>
            <div class="mb-3">
              <label for="description" class="form-label">Description</label>
              <textarea
                class="form-control"
                id="description"
                [(ngModel)]="currentItem.description"
                name="description"
              ></textarea>
            </div>
            <div class="mb-3">
              <label for="price" class="form-label">Price</label>
              <input
                type="number"
                step="0.01"
                class="form-control"
                id="price"
                [(ngModel)]="currentItem.price"
                name="price"
                required
              />
            </div>
            <div class="mb-3">
              <label for="stockLevel" class="form-label">Stock Level</label>
              <input
                type="number"
                class="form-control"
                id="stockLevel"
                [(ngModel)]="currentItem.stock_level"
                name="stock_level"
                required
              />
            </div>
            <div class="mb-3">
              <label for="imageUrl" class="form-label">Image URL</label>
              <input
                type="text"
                class="form-control"
                id="imageUrl"
                [(ngModel)]="currentItem.image_url"
                name="image_url"
              />
            </div>
            <div class="mb-3">
              <label for="category" class="form-label">Category</label>
              <input
                type="text"
                class="form-control"
                id="category"
                [(ngModel)]="currentItem.category"
                name="category"
              />
            </div>
            <div class="d-flex justify-content-between">
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="!itemForm.form.valid"
              >
                {{ currentItem.id ? "Update" : "Add" }} Item
              </button>
              <button
                type="button"
                class="btn btn-secondary"
                (click)="cancelEdit()"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3>Current Inventory</h3>
        <button
          *ngIf="!isEditMode"
          class="btn btn-success"
          (click)="startAddNew()"
        >
          Add New Item
        </button>
      </div>

      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items; trackBy: trackByItemId">
              <td>
                <img
                  *ngIf="item.image_url"
                  [src]="item.image_url"
                  alt="{{ item.name }}"
                  class="img-thumbnail"
                  style="max-width: 100px; max-height: 100px;"
                />
                <span *ngIf="!item.image_url">No Image</span>
              </td>
              <td>{{ item.name }}</td>
              <td>{{ item.description }}</td>
              <td>\${{ item.price }}</td>
              <td>{{ item.stock_level }}</td>
              <td>{{ item.category }}</td>
              <td>
                <button
                  class="btn btn-sm btn-secondary me-2"
                  (click)="editItem(item)"
                >
                  Edit
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  (click)="deleteItem(item.id)"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ItemManagementComponent implements OnInit {
  items: Item[] = []
  currentItem: Partial<Item> = {}
  isEditMode = false

  constructor(private apiService: ApiService, private toastr: ToastrService) {}

  ngOnInit() {
    this.loadItems()
  }

  // Track items by their unique identifier to improve rendering performance
  trackByItemId(index: number, item: Item): number {
    return item.id
  }

  loadItems() {
    this.apiService.getItems().subscribe({
      next: (response: any) => {
        // Check if response has a records property
        const items = response.records || response

        // Ensure items is an array and has proper typing
        this.items = Array.isArray(items) ? items : []
      },
      error: (error) => {
        console.error("Error loading items", error)
        this.toastr.error("Error loading items", "Error")
        this.items = [] // Ensure items is an empty array on error
      },
    })
  }

  startAddNew() {
    this.currentItem = {}
    this.isEditMode = true
  }

  saveItem(form: NgForm) {
    // Validate form before submission
    if (form.invalid) {
      return
    }

    const itemToSave: Item = {
      ...(this.currentItem as Item),
      id: this.currentItem.id || 0, // Ensure id is a number
    }

    if (this.currentItem.id) {
      // Update existing item
      this.apiService.updateItem(itemToSave).subscribe({
        next: () => {
          this.loadItems()
          this.cancelEdit()
          this.toastr.success("Item updated successfully", "Success")
        },
        error: (error) => {
          console.error("Error updating item", error)
          this.toastr.error("Failed to update item", "Error")
        },
      })
    } else {
      // Create new item
      // Remove id for new item creation
      const newItem: Item = { ...itemToSave }

      this.apiService.createItem(newItem).subscribe({
        next: () => {
          this.loadItems()
          this.cancelEdit()
          this.toastr.success("Item added successfully", "Success")
        },
        error: (error) => {
          console.error("Error creating item", error)
          this.toastr.error("Failed to add item", "Error")
        },
      })
    }
  }

  editItem(item: Item) {
    // Create a deep copy of the item to avoid direct mutation
    this.currentItem = { ...item }
    this.isEditMode = true
  }

  deleteItem(id: number) {
    if (confirm("Are you sure you want to delete this item?")) {
      this.apiService.deleteItem(id.toString()).subscribe({
        next: () => {
          this.loadItems()
          this.toastr.success("Item deleted successfully", "Success")
        },
        error: (error) => {
          console.error("Error deleting item", error)
          this.toastr.error("Failed to delete item", "Error")
        },
      })
    }
  }

  cancelEdit() {
    this.currentItem = {}
    this.isEditMode = false
  }
}
