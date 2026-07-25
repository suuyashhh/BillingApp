import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarcodePrinterComponent } from './barcode-printer.component';

describe('BarcodePrinterComponent', () => {
  let component: BarcodePrinterComponent;
  let fixture: ComponentFixture<BarcodePrinterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarcodePrinterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BarcodePrinterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
