import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface Product {
  product_id?: number;
  english_name: string;
  marathi_name: string;
  weight: string;
  price: number;
  barcodeNo?: number | null;
}

@Component({
  selector: 'app-product-entries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-entries.component.html',
  styleUrl: './product-entries.component.css'
})
export class ProductEntriesComponent implements OnInit {
  products: Product[] = [];
  isDrawerOpen = false;
  searchQuery = '';

  // Form inputs
  productId: number | null = null;
  englishName = '';
  marathiName = '';
  weight: string = '';
  price: number | null = null;
  barcode = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts() {
    this.api.get('ProductEntries/GetAllEntries').subscribe({
      next: (res: any) => {
        this.products = res || [];
      },
      error: (err) => {
        console.error('Failed to load products', err);
      }
    });
  }

  openDrawer() {
    this.isDrawerOpen = true;
  }

  closeDrawer() {
    this.isDrawerOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.productId = null;
    this.englishName = '';
    this.marathiName = '';
    this.weight = '';
    this.price = null;
    this.barcode = '';
  }

  generateUniqueBarcode() {
    let newBarcode = '';
    let isUnique = false;
    
    while (!isUnique) {
      const randomPart = Math.floor(100000000 + Math.random() * 900000000).toString(); // 9 digits
      newBarcode = '890' + randomPart;
      
      const exists = this.products.some(p => p.barcodeNo?.toString() === newBarcode);
      if (!exists) {
        isUnique = true;
      }
    }
    
    this.barcode = newBarcode;
  }

  editProduct(product: Product) {
    this.productId = product.product_id || null;
    this.englishName = product.english_name;
    this.marathiName = product.marathi_name;
    this.weight = product.weight || '';
    this.price = product.price;
    this.barcode = product.barcodeNo ? product.barcodeNo.toString() : '';
    this.openDrawer();
  }

  saveProduct() {
    if (!this.englishName) return;

    const productData: Product = {
      product_id: this.productId || 0,
      english_name: this.englishName,
      marathi_name: this.marathiName || '',
      weight: this.weight || '',
      price: this.price || 0,
      barcodeNo: this.barcode ? parseInt(this.barcode, 10) : null
    };

    if (this.productId) {
      // Update
      this.api.put('ProductEntries/UpdateProductEntry', productData).subscribe({
        next: () => {
          this.getProducts();
          this.closeDrawer();
        },
        error: (err) => {
          console.error('Failed to update product', err);
        }
      });
    } else {
      // Save
      this.api.post('ProductEntries/SaveProductEntry', productData).subscribe({
        next: () => {
          this.getProducts();
          this.closeDrawer();
        },
        error: (err) => {
          console.error('Failed to save product', err);
        }
      });
    }
  }

  deleteProduct(productId: number | undefined) {
    if (!productId) return;
    if (confirm('Are you sure you want to delete this product?')) {
      this.api.delete('ProductEntries/DeleteProductEntry/' + productId).subscribe({
        next: () => {
          this.getProducts();
        },
        error: (err) => {
          console.error('Failed to delete product', err);
        }
      });
    }
  }

  filteredProducts() {
    if (!this.searchQuery) return this.products;
    const query = this.searchQuery.toLowerCase().trim();
    return this.products.filter(p => 
      (p.english_name?.toLowerCase() || '').includes(query) ||
      (p.marathi_name?.toLowerCase() || '').includes(query) ||
      (p.barcodeNo?.toString() || '').includes(query)
    );
  }
}
