import { Component, OnInit } from '@angular/core';

import * as M from 'mapbox-gl';
import * as T from '@turf/turf';

@Component({
  selector: 'app-turf',
  templateUrl: './turf.component.html',
  styleUrls: ['./turf.component.css']
})
export class TurfComponent implements OnInit {

  constructor() { }

  accessToken = 'pk.eyJ1IjoibGF1cmVub2xkaGFtMTIwMiIsImEiOiJjaW55dm52N2gxODJrdWtseWZ5czAyZmp5In0.YkEUt6GvIDujjudu187eyA';

  ngOnInit() {

    (M as any).accessToken = this.accessToken;

    const map = new M.Map({
      container: 'map2',
      style: 'mapbox://styles/mapbox/light-v9',
      center: [-84.5, 38.05],
      zoom: 12,
    });

    const hospitals = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: { Name: 'VA Medical Center -- Leestown Division', Address: '2250 Leestown Rd' },
          geometry: { type: 'Point', coordinates: [-84.539487, 38.072916] } },
        { type: 'Feature', properties: { Name: 'St. Joseph East', Address: '150 N Eagle Creek Dr' },
          geometry: { type: 'Point', coordinates: [-84.440434, 37.998757] } },
        { type: 'Feature', properties: { Name: 'Central Baptist Hospital', Address: '1740 Nicholasville Rd' },
          geometry: { type: 'Point', coordinates: [-84.512283, 38.018918] } },
        { type: 'Feature', properties: { Name: 'VA Medical Center -- Cooper Dr Division', Address: '1101 Veterans Dr' },
          geometry: { type: 'Point', coordinates: [-84.506483, 38.02972] } },
        { type: 'Feature', properties: { Name: 'Shriners Hospital for Children', Address: '1900 Richmond Rd' },
          geometry: { type: 'Point', coordinates: [-84.472941, 38.022564] } },
        { type: 'Feature', properties: { Name: 'Eastern State Hospital', Address: '627 W Fourth St' },
          geometry: { type: 'Point', coordinates: [-84.498816, 38.060791] } },
        { type: 'Feature', properties: { Name: 'Cardinal Hill Rehabilitation Hospital', Address: '2050 Versailles Rd' },
          geometry: { type: 'Point', coordinates: [-84.54212, 38.046568] } },
        { type: 'Feature', properties: { Name: 'St. Joseph Hospital', ADDRESS: '1 St Joseph Dr' },
          geometry: { type: 'Point', coordinates: [-84.523636, 38.032475] } },
        { type: 'Feature', properties: { Name: 'UK Healthcare Good Samaritan Hospital', Address: '310 S Limestone' },
          geometry: { type: 'Point', coordinates: [-84.501222, 38.042123] } },
        { type: 'Feature', properties: { Name: 'UK Medical Center', Address: '800 Rose St' },
          geometry: { type: 'Point', coordinates: [-84.508205, 38.031254] } }
      ]
    };

    const libraries = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: { Name: 'Village Branch', Address: '2185 Versailles Rd' },
          geometry: { type: 'Point', coordinates: [-84.548369, 38.047876] } },
        { type: 'Feature', properties: { Name: 'Northside Branch', ADDRESS: '1733 Russell Cave Rd' },
          geometry: { type: 'Point', coordinates: [-84.47135, 38.079734] } },
        { type: 'Feature', properties: { Name: 'Central Library', ADDRESS: '140 E Main St' },
          geometry: { type: 'Point', coordinates: [-84.496894, 38.045459] } },
        { type: 'Feature', properties: { Name: 'Beaumont Branch', Address: '3080 Fieldstone Way' },
          geometry: { type: 'Point', coordinates: [-84.557948, 38.012502] } },
        { type: 'Feature', properties: { Name: 'Tates Creek Branch', Address: '3628 Walden Dr' },
          geometry: { type: 'Point', coordinates: [-84.498679, 37.979598] } },
        { type: 'Feature', properties: { Name: 'Eagle Creek Branch', Address: '101 N Eagle Creek Dr' },
          geometry: { type: 'Point', coordinates: [-84.442219, 37.999437] } }
      ]
    };

    map.on('load', () => {
      map.addLayer({
        id: 'hospitals',
        type: 'symbol',
        source: {
          type: 'geojson',
          data: hospitals,
        },
        layout: {
          'icon-image': 'hospital-15',
        },
        paint: { }
      } as M.Layer);  // have to include as M.Layer or type doesn't work

      map.addLayer({
        id: 'libraries',
        type: 'symbol',
        source: {
          type: 'geojson',
          data: libraries,
        },
        layout: {
          'icon-image': 'library-15',
        },
        paint: { }
      } as M.Layer);

      // empty constant for popup
      const popup = new M.Popup();

      // place inside map on load to prevent errors for using mouseover before layers are added
      map.on('mousemove', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['hospitals', 'libraries'] });

        const feature = features[0];

        // add and set popup if point exists at mouseover location
        if (feature) {
          popup.setLngLat(feature.geometry['coordinates'])
            .setHTML(feature.properties.Name)
            .addTo(map);
        } else {
          popup.remove();  // remove popups when not being moused over
          return;  // set variable to undefined
        }

        // change cursor style to pointer if mousing over a feature so user knows it's clickable
        map.getCanvas().style.cursor = feature ? 'pointer' : 'grab';
      });

      map.addSource('nearest-hospital', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [ ],
        }
      });

      map.on('click', (e) => {
        const libraryFeatures = map.queryRenderedFeatures(e.point, { layers: ['libraries'] });
        if (!libraryFeatures.length) {
          return;
        }
        const libraryFeature = libraryFeatures[0];

        // convert to Turf types for proper use of geoprocessing methods in Turf
        const nearestHospital = T.nearest(libraryFeature as T.Coord, hospitals as T.FeatureCollection<T.Point>);
        if (nearestHospital) {

          // convert source layer to GeoJsonSource to access .setData method - can't be done directly in initialization of nearest-hospitals
          const nearestHospitalGeoJson = map.getSource('nearest-hospital') as M.GeoJSONSource;

          // add features to nearest-hospital map layer
          nearestHospitalGeoJson.setData({
            type: 'FeatureCollection',
            features: [
              nearestHospital
            ]
          });

          // remove previous selection if it exists
          if (map.getLayer('nearest-hospital')) {
            map.removeLayer('nearest-hospital');
          }

          map.addLayer({
            id: 'nearest-hospital',
            type: 'circle',
            source: 'nearest-hospital',
            paint: {
              'circle-radius': 14,
              'circle-color': '#227ECF',
            }
          }, 'hospitals');  // inserts nearest-hospitals layer BEFORE/underneath hospitals layer
        }
      });
    });  // end map on load
  }
}
