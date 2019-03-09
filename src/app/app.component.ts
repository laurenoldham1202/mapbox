import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  public fb: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.fb = this.formBuilder.group({
      'demo': 'mapboxDraw'
    });
  }
}
