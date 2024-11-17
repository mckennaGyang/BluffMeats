import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Item } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private items: Item[] = [];

  getItems(): Observable<Item[]> {
    return of(this.items);
  }

  addItem(item: Item): Observable<Item> {
    this.items.push(item);
    return of(item);
  }

  updateItem(item: Item): Observable<Item> {
    const index = this.items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      this.items[index] = item;
    }
    return of(item);
  }

  deleteItem(id: string): Observable<boolean> {
    const index = this.items.findIndex(i => i.id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
      return of(true);
    }
    return of(false);
  }
}