import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeojsonTestComponent } from './geojson-test.component';

describe('GeojsonTestComponent', () => {
  let component: GeojsonTestComponent;
  let fixture: ComponentFixture<GeojsonTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeojsonTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeojsonTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
