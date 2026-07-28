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
  selector: 'app-barcode-printer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './barcode-printer.component.html',
  styleUrl: './barcode-printer.component.css'
})
export class BarcodePrinterComponent implements OnInit {
  // Inventory state
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  searchQuery: string = '';
  selectedProduct: Product | null = null;

  // Editable Sticker Fields (Defaults match user image sample)
  repackedByLabel: string = 'Repacked By :-';
  repackedByName: string = 'तेजस नाश्ता केंद्र';
  isVeg: boolean = true;
  barcodeNo: string = '345';
  pkdDate: string = '';
  displayProductName: string = 'हरभरा २५० ग्रॉम';
  mrp: number = 20.00;
  custCareNo: string = '9923949409';
  bestBefore: string = 'month';
  fssaiNo: string = '21517260000358';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    // Default Pkd Date to today in dd/M/yyyy format (e.g. 20/5/2026)
    const today = new Date();
    const dd = today.getDate();
    const mm = today.getMonth() + 1;
    const yyyy = today.getFullYear();
    this.pkdDate = `${dd}/${mm}/${yyyy}`;

    this.getProducts();
  }

  getProducts() {
    this.api.get('ProductEntries/GetAllEntries').subscribe({
      next: (res: any) => {
        this.allProducts = res || [];
        this.filteredProducts = [...this.allProducts];
        
        // Auto-select first product if available
        if (this.allProducts.length > 0 && !this.selectedProduct) {
          this.selectProduct(this.allProducts[0]);
        }
      },
      error: (err) => {
        console.error('Failed to load products for printer', err);
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
      (p.barcodeNo?.toString() || '').includes(query) ||
      (p.weight?.toLowerCase() || '').includes(query)
    );
  }

  selectProduct(product: Product) {
    this.selectedProduct = product;
    this.barcodeNo = product.barcodeNo ? product.barcodeNo.toString() : '345';
    
    const marathi = product.marathi_name || product.english_name || '';
    const weightVal = product.weight || '';
    this.displayProductName = `${marathi} ${weightVal}`.trim();
    this.mrp = product.price || 0.00;
  }

  // Code 39 Barcode SVG Bar Generator
  getBarcodeBars(inputCode: string): { x: number; width: number }[] {
    const code = (inputCode || '0').toString().toUpperCase().trim();
    
    // Code 39 standard pattern table (1 = wide, 0 = narrow. Odd index = bar, even index = space)
    const patterns: { [key: string]: string } = {
      '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
      '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
      '8': '100100100', '9': '001100100', 'A': '100001001', 'B': '001001001',
      'C': '101001000', 'D': '000011001', 'E': '100011000', 'F': '001011000',
      'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
      'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
      'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
      'S': '001000110', 'T': '000010110', 'U': '110000001', 'V': '011000001',
      'W': '111000000', 'X': '010010001', 'Y': '110010000', 'Z': '011010000',
      '-': '010000101', '.': '110000100', ' ': '011000100', '*': '010010100'
    };

    const formattedCode = `*${code}*`;
    const bars: { x: number; width: number }[] = [];
    let currX = 5;    // Start margin
    const narrow = 2; // Narrow bar width
    const wide = 5;   // Wide bar width

    for (let i = 0; i < formattedCode.length; i++) {
      const char = formattedCode[i];
      const pattern = patterns[char] || patterns['0'];
      for (let j = 0; j < 9; j++) {
        const isBar = j % 2 === 0;
        const isWide = pattern[j] === '1';
        const w = isWide ? wide : narrow;
        if (isBar) {
          bars.push({ x: currX, width: w });
        }
        currX += w;
      }
      currX += narrow; // Inter-character gap
    }
    return bars;
  }

  getBarcodeTotalWidth(inputCode: string): number {
    const bars = this.getBarcodeBars(inputCode);
    if (bars.length === 0) return 150;
    const lastBar = bars[bars.length - 1];
    return lastBar.x + lastBar.width + 5;
  }

  printSticker() {
    if (!this.selectedProduct && !this.displayProductName) {
      alert('Please select or configure a product before printing.');
      return;
    }
    window.print();
  }
}
