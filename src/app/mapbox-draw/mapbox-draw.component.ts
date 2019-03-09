import { Component, OnInit } from '@angular/core';

import * as M from 'mapbox-gl';
import * as MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as GeoCoder from '@mapbox/mapbox-gl-geocoder';
import * as T from '@turf/turf';


import { sites } from '../../assets/sites.geojson';
// TODO: Add documentation for this geojson formatting
import { NA_SITES } from '../../assets/na_sites.geojson';

@Component({
  selector: 'app-mapbox-draw',
  templateUrl: './mapbox-draw.component.html',
  styleUrls: ['./mapbox-draw.component.css']
})
export class MapboxDrawComponent implements OnInit {

  constructor() { }

  accessToken = 'pk.eyJ1IjoibGF1cmVub2xkaGFtMTIwMiIsImEiOiJjaW55dm52N2gxODJrdWtseWZ5czAyZmp5In0.YkEUt6GvIDujjudu187eyA';

  ngOnInit() {
    // workaround because accessToken module is constant and can't be set directly, prevent error of M being a read-only constant
    (M as any).accessToken = this.accessToken;

    // instantiate map
    const map = new M.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v9',  // tiles
      zoom: 5,
      center: [-98.880453, 32.897852],
    });

    // instatiate polygon drawing panel, add to map
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
    });
    // map.addControl(draw);  // can add secondary position argument
    document.getElementById('draw-container').appendChild(draw.onAdd(map));

    // instatiate geocoder (type in location to pan and zoom there), add to map
    const geocoder = new GeoCoder({ accessToken: this.accessToken, placeholder: 'MAP SEARCH' });
    // map.addControl(geocoder);
    document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

    map.on('load', (e) => {

      map.addLayer({
        id: 'sites',
        type: 'circle',
        source: {
          type: 'geojson',
          data: NA_SITES,
        },
        paint: {
          'circle-radius': 10,
          'circle-color': '#3887be',
          'circle-stroke-width': 1,
          'circle-stroke-color': 'black',
        },
      } as M.Layer);

      // instantiate empty geojson for selected points
      map.addSource('selected-pts', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [ ],
        }
      });
    });

    // drawing from the polygon draw tool
    map.on('draw.create', (e) => {

      // find point/polygon intersection and add to map layer
      this.selectPoints(map, draw);

      // add newly selected points to the map
      map.addLayer({
        id: 'selected-pts-layer',
        type: 'circle',
        source: 'selected-pts',
        paint: {
          'circle-radius': 12,
          'circle-color': 'orange',
          'circle-stroke-width': 4,
          'circle-stroke-color': 'black',
        }
      });
    });

    // deleting from the polygon draw tool
    map.on('draw.delete', (e) => {
      // console.log(e.features[0]);
      this.selectPoints(map, draw);

    });

    // updating from the polygon draw tool
    map.on('draw.update', (e) => {
      this.selectPoints(map, draw);
    });
  }

  selectPoints(mapObject, drawObject) {
    // all drawn polygons grouped together
    const drawnPolygons = drawObject.getAll();

    // find points within the drawn polygons - just use raw geojsons, NOT layers
    const selectedPts = T.pointsWithinPolygon(NA_SITES as T.FeatureCollection<T.Point>, drawnPolygons);
    const selectedPtsGeojson = mapObject.getSource('selected-pts') as M.GeoJSONSource;  // convert to GeoJsonSource to access setData method

    console.log(selectedPts.features);

    // create proper geojson to be added to new layer
    // it appears that selectedPts should be able to be passed into setData() directly, but there is a type mismatch
    // it seems that it needs to accept "type: 'FeatureCollection'" as a string and the feature geometry separately
    selectedPtsGeojson.setData({
      type: 'FeatureCollection',
      features: selectedPts.features  // already in array, so no need for square brackets
    });
  }
}
