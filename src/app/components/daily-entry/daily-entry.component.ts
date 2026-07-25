import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface SelectedProduct {
  srNo: number;
  product_id: number;
  name: string;
  quantity: number;
  price: number;
}

interface Product {
  product_id?: number;
  english_name: string;
  marathi_name: string;
  quantity: string;
  price: number;
  barcodeNo?: number | null;
}

@Component({
  selector: 'app-daily-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './daily-entry.component.html',
  styleUrl: './daily-entry.component.css'
})
export class DailyEntryComponent implements OnInit {
  // Header inputs
  cust_Id: string = '';
  custName: string = '';
  custMobNo: string = '';
  date: string = '';
  invoiceNo: string = '';

  // Search & List state
  searchQuery: string = '';
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  showDropdown: boolean = false;

  // Selected products in the table
  selectedProducts: SelectedProduct[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    // Default date to today (yyyy-MM-dd format for HTML date input)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.date = `${yyyy}-${mm}-${dd}`;

    // Auto-generate invoice number prefix/mock
    this.invoiceNo = 'INV-' + Math.floor(100000 + Math.random() * 900000);

    // Fetch products
    this.getProducts();
  }

  getProducts() {
    this.api.get('ProductEntries/GetAllEntries').subscribe({
      next: (res: any) => {
        this.allProducts = res || [];
        this.filteredProducts = [...this.allProducts];
      },
      error: (err) => {
        console.error('Failed to load products', err);
      }
    });
  }

  onSearchInput() {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredProducts = [...this.allProducts];
      return;
    }
    this.filteredProducts = this.allProducts.filter(p =>
      (p.english_name?.toLowerCase() || '').includes(query) ||
      (p.marathi_name?.toLowerCase() || '').includes(query) ||
      (p.barcodeNo?.toString() || '').includes(query)
    );
  }

  onSearchFocus() {
    this.showDropdown = true;
    // Refresh products list in case new ones were added
    this.getProducts();
  }

  onSearchBlur() {
    // Delay blur to allow clicks on dropdown items
    setTimeout(() => {
      this.showDropdown = false;
    }, 250);
  }

  addProductToTable(product: Product) {
    if (!product.product_id) return;

    // Check if product is already in the table
    const existing = this.selectedProducts.find(p => p.product_id === product.product_id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.selectedProducts.push({
        srNo: this.selectedProducts.length + 1,
        product_id: product.product_id,
        name: `${product.english_name} ${product.marathi_name ? '(' + product.marathi_name + ')' : ''}`,
        quantity: 1,
        price: product.price || 0
      });
    }

    // Reset Sr. No. in order
    this.updateSrNumbers();

    // Reset search
    this.searchQuery = '';
    this.showDropdown = false;
  }

  removeProduct(index: number) {
    this.selectedProducts.splice(index, 1);
    this.updateSrNumbers();
  }

  updateSrNumbers() {
    this.selectedProducts.forEach((prod, index) => {
      prod.srNo = index + 1;
    });
  }

  // Header actions
  clearForm() {
    this.cust_Id = '';
    this.custName = '';
    this.custMobNo = '';
    this.selectedProducts = [];
    this.invoiceNo = 'INV-' + Math.floor(100000 + Math.random() * 900000);
  }

  previousInvoice() {
    alert('Load previous invoice (Mock functionality)');
  }

  nextInvoice() {
    alert('Load next invoice (Mock functionality)');
  }

  // Compute grand total
  getGrandTotal(): number {
    return this.selectedProducts.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  }
}
