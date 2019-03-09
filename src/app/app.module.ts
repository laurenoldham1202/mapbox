import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';

import { AppComponent } from './app.component';
import { GeojsonTestComponent } from './geojson-test/geojson-test.component';
import { MapboxDrawComponent } from './mapbox-draw/mapbox-draw.component';
import { MaterialModule } from './material.module';
import { RadioButtonsComponent } from './radio-buttons/radio-buttons.component';
import { TurfComponent } from './turf/turf.component';
import { ImageCatalogComponent } from './image-catalog/image-catalog.component';

@NgModule({
  declarations: [
    AppComponent,
    RadioButtonsComponent,
    GeojsonTestComponent,
    MapboxDrawComponent,
    TurfComponent,
    ImageCatalogComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    MaterialModule,
    NgbModule,
    NgxMapboxGLModule.withConfig({
      accessToken: 'pk.eyJ1IjoibGF1cmVub2xkaGFtMTIwMiIsImEiOiJjaW55dm52N2gxODJrdWtseWZ5czAyZmp5In0.YkEUt6GvIDujjudu187eyA',
    }),
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
