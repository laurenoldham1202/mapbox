import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-radio-buttons',
  templateUrl: './radio-buttons.component.html',
  styleUrls: ['./radio-buttons.component.css']
})
export class RadioButtonsComponent implements OnInit {

  layerId = 'basic';
  style: string;
  form: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {

    this.form = this.fb.group({
      mapFill: 'basic'
    });

    this.changeStyle();

  }

  changeStyle() {
    console.log(this.form.value.mapFill);
    this.style = `mapbox://styles/mapbox/${this.form.value.mapFill}-v9`;
  }

}
