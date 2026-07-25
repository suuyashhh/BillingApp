import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductEntriesComponent } from './product-entries.component';

describe('ProductEntriesComponent', () => {
  let component: ProductEntriesComponent;
  let fixture: ComponentFixture<ProductEntriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductEntriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductEntriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
