import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageCatalogComponent } from './image-catalog.component';

describe('ImageCatalogComponent', () => {
  let component: ImageCatalogComponent;
  let fixture: ComponentFixture<ImageCatalogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageCatalogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
