import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapboxDrawComponent } from './mapbox-draw.component';

describe('MapboxDrawComponent', () => {
  let component: MapboxDrawComponent;
  let fixture: ComponentFixture<MapboxDrawComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapboxDrawComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapboxDrawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
