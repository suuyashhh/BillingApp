import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  englishName: string;
  marathiName: string;
  quantity: number;
  price: number;
  barcode: string;
}

@Component({
  selector: 'app-product-entries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-entries.component.html',
  styleUrl: './product-entries.component.css'
})
export class ProductEntriesComponent {
  products: Product[] = [
    { englishName: 'Apple', marathiName: 'सफरचंद', quantity: 15, price: 180, barcode: '890123456789' },
    { englishName: 'Banana', marathiName: 'केळी', quantity: 30, price: 40, barcode: '890123456790' },
    { englishName: 'Potato', marathiName: 'बटाटा', quantity: 50, price: 30, barcode: '890123456791' },
    { englishName: 'Tomato', marathiName: 'टोमॅटो', quantity: 25, price: 60, barcode: '890123456792' }
  ];

  isDrawerOpen = false;
  searchQuery = '';

  // Form inputs
  englishName = '';
  marathiName = '';
  quantity: number | null = null;
  price: number | null = null;
  barcode = '';

  openDrawer() {
    this.isDrawerOpen = true;
  }

  closeDrawer() {
    this.isDrawerOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.englishName = '';
    this.marathiName = '';
    this.quantity = null;
    this.price = null;
    this.barcode = '';
  }

  saveProduct() {
    if (!this.englishName) return;
    this.products.unshift({
      englishName: this.englishName,
      marathiName: this.marathiName,
      quantity: this.quantity || 0,
      price: this.price || 0,
      barcode: this.barcode
    });
    this.closeDrawer();
  }

  deleteProduct(index: number) {
    this.products.splice(index, 1);
  }

  filteredProducts() {
    if (!this.searchQuery) return this.products;
    const query = this.searchQuery.toLowerCase();
    return this.products.filter(p => 
      p.englishName.toLowerCase().includes(query) ||
      p.marathiName.includes(query) ||
      p.barcode.includes(query)
    );
  }
}
