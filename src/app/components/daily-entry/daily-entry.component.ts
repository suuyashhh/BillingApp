import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface SelectedProduct {
  srNo: number;
  product_id: number;
  name: string;
  marathi_name?: string;
  english_name?: string;
  weight?: string;
  quantity: number;
  price: number;
  mrp?: number;
}

interface Product {
  product_id?: number;
  english_name: string;
  marathi_name: string;
  weight: string;
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

  // Barcode Scanner Tracking
  barcodeBuffer: string = '';
  lastKeystrokeTime: number = 0;

  constructor(private api: ApiService) {}

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Ignore keydown if the user is typing in certain specific input fields where we DON'T want scanner interference
    // But usually we just let it capture and clear the buffer if it's too slow (human typing)
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - this.lastKeystrokeTime;

    // Human typing is usually > 50-100ms. Barcode scanners are usually < 30ms per character.
    if (timeDiff > 100) {
      this.barcodeBuffer = '';
    }

    if (event.key === 'Enter' && this.barcodeBuffer.length > 3) {
      // Barcode scanned successfully
      this.processBarcode(this.barcodeBuffer);
      this.barcodeBuffer = '';
      event.preventDefault();
      return;
    }

    // Capture standard printable characters
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      this.barcodeBuffer += event.key;
    }

    this.lastKeystrokeTime = currentTime;
  }

  processBarcode(barcode: string) {
    const matchedProduct = this.allProducts.find(p => p.barcodeNo?.toString() === barcode);
    if (matchedProduct) {
      this.addProductToTable(matchedProduct);

      // If the user's cursor was in an input field, the barcode scanner would have typed the characters there.
      // We can optionally clear it if we know they might have been in the search box.
      if (document.activeElement?.tagName === 'INPUT') {
        const input = document.activeElement as HTMLInputElement;
        // If it's the search box, clear it because the product was successfully added
        if (input.placeholder?.toLowerCase().includes('search')) {
          this.searchQuery = '';
          this.onSearchInput(); // refresh the list
        }
      }
    }
  }

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
      const marathi = product.marathi_name || product.english_name || '';
      const weightVal = product.weight || '';
      const displayName = `${marathi} ${weightVal}`.trim();

      this.selectedProducts.push({
        srNo: this.selectedProducts.length + 1,
        product_id: product.product_id,
        name: displayName,
        marathi_name: product.marathi_name,
        english_name: product.english_name,
        weight: product.weight,
        quantity: 1,
        price: product.price || 0,
        mrp: product.price ? Math.round(product.price * 1.15) : 0
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










  // All for Printer
  getTotalQty(): number {
    return this.selectedProducts.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }

  getTotalSavings(): number {
    return this.selectedProducts.reduce((sum, item) => {
      const mrp = item.mrp || (item.price * 1.15);
      return sum + ((mrp - item.price) * item.quantity);
    }, 0);
  }

  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  printInvoice() {
    if (this.selectedProducts.length === 0) {
      alert('Please add at least one item to the invoice before printing.');
      return;
    }
    window.print();
  }
}
