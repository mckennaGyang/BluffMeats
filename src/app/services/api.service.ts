import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../models/item.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private apiUrl = "http://localhost/api";
  headers = new HttpHeaders({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });

  constructor(private http: HttpClient) {}

  // Items endpoints
  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/endpoints/read.php`);
  }

  createItem(item: Item): Observable<Item> {
    return this.http.post<Item>(`${this.apiUrl}/endpoints/create.php`, item, {headers: this.headers});
  }

  updateItem(item: Item): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/endpoints/update.php`, item, {
      headers: this.headers,
    });
  }

  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/endpoints/delete.php?id=${id}`,
      { headers: this.headers }
    );
  }
}