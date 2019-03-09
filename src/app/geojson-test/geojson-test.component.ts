import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {china} from '../../assets/china.geojson';
import {africa} from '../../assets/africa.geojson';
import {global} from '../../assets/global.geojson';
import {maine} from '../../assets/maine.geojson';
import {volcano} from '../../assets/volcano.geojson';

@Component({
  selector: 'app-geojson-test',
  templateUrl: './geojson-test.component.html',
  styleUrls: ['./geojson-test.component.css']
})
export class GeojsonTestComponent implements OnInit {

  china = china;
  maine = maine;
  africa = africa;
  volcano = volcano;
  global = global;

  region: any = null;

  style = {
    'fill-color': 'blue',
    'fill-opacity': 0.4,
  };

  styleLines = {
    'line-color': '#627BC1',
    'line-width': 4
  };

  form: FormGroup

  constructor(private fb: FormBuilder) { }

  ngOnInit() {

    this.form = this.fb.group({
      subscription: 'Global'
    });
    this.registerOnChange();

  }

  updateRegion(area: string) {
    switch (area) {
      case 'China':
        this.region = china;
        break;
      case 'Africa':
        this.region = africa;
        break;
      case 'Global':
        this.region = global;
        break;
    }
  }

  registerOnChange() {
    this.updateRegion(this.form.value.subscription);
    console.log(this.region);
  }
}
