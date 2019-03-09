import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material';

import * as GeoCoder from '@mapbox/mapbox-gl-geocoder';
import * as M from 'mapbox-gl';
import * as MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as T from '@turf/turf';

import { IMAGE_FOOTPRINTS_EGY } from '../../assets/image-footprints.geojson';
import {FeatureCollection} from 'geojson';
import {FormBuilder, FormGroup} from '@angular/forms';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'app-image-catalog',
  templateUrl: './image-catalog.component.html',
  styleUrls: ['./image-catalog.component.css'],
  // Need to remove view encapsulation so that the custom tooltip style defined in
  // `tooltip-custom-class-example.css` will not be scoped to this component's view.
  encapsulation: ViewEncapsulation.None,
})
export class ImageCatalogComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
  ) { }

  accessToken = 'pk.eyJ1IjoibGF1cmVub2xkaGFtMTIwMiIsImEiOiJjaW55dm52N2gxODJrdWtseWZ5czAyZmp5In0.YkEUt6GvIDujjudu187eyA';
  draw: MapboxDraw;
  drawnPolygons = null;
  form: FormGroup;
  geocoder: GeoCoder;
  intersectedPolygons = [];
  map: M.Map;
  viewResults = false;

  displayedColumns: string[] = ['select', 'position', 'name', 'weight', 'symbol'];

  // dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  selection = new SelectionModel<any>(true, []);
  dataSource = [];
  resultsButtonText = 'VIEW RESULTS';
  buttonType = 'primary';

  ngOnInit() {
    this.form = this.fb.group({
      domain: '',
      mode: '',
      resolution: '',
      angle: '',
    });

    (M as any).accessToken = this.accessToken;

    this.map = new M.Map({
      container: 'map-catalog',
      style: 'mapbox://styles/mapbox/light-v9',  // tiles
      zoom: 1,
    });

    const customStyle = [
      // fill when polygon is finished
      {
        'id': 'gl-draw-polygon-fill-inactive',
        'type': 'fill',
        'filter': ['all', ['==', 'active', 'false'],
          ['==', '$type', 'Polygon'],
          ['!=', 'mode', 'static']
        ],
        'paint': {
          'fill-color': '#A80B0B',
          'fill-outline-color': '#A80B0B',
          'fill-opacity': 0.3
        }
      },
      // fill when polygon is unfinished/active
      {
        'id': 'gl-draw-polygon-fill-active',
        'type': 'fill',
        'filter': ['all', ['==', 'active', 'true'],
          ['==', '$type', 'Polygon']
        ],
        'paint': {
          'fill-color': '#D20C0C',
          'fill-outline-color': '#D20C0C',
          'fill-opacity': 0.1
        }
      },
      // outline when polygon is finished
      {
        'id': 'gl-draw-polygon-stroke-inactive',
        'type': 'line',
        'filter': ['all', ['==', 'active', 'false'],
          ['==', '$type', 'Polygon'],
          ['!=', 'mode', 'static']
        ],
        'layout': {
          'line-cap': 'round',
          'line-join': 'round'
        },
        'paint': {
          'line-color': '#A80B0B',
          'line-width': 2
        }
      },
      // outline for active/unfinished polygon
      {
        'id': 'gl-draw-polygon-stroke-active',
        'type': 'line',
        'filter': ['all', ['==', 'active', 'true'],
          ['==', '$type', 'Polygon']
        ],
        'layout': {
          'line-cap': 'round',
          'line-join': 'round'
        },
        'paint': {
          'line-color': '#D20C0C',
          'line-dasharray': [0.2, 2],
          'line-width': 2
        }
      },
      // starting line when you begin to draw polygon
      {
        'id': 'gl-draw-line-active',
        'type': 'line',
        'filter': ['all', ['==', '$type', 'LineString'],
          ['==', 'active', 'true']
        ],
        'layout': {
          'line-cap': 'round',
          'line-join': 'round'
        },
        'paint': {
          'line-color': '#D20C0C',
          'line-dasharray': [0.2, 2],
          'line-width': 2
        }
      },
      // line of each vertex you click as you're drawing the polygon
      {
        'id': 'gl-draw-polygon-and-line-vertex-stroke-inactive',
        'type': 'circle',
        'filter': ['all', ['==', 'meta', 'vertex'],
          ['==', '$type', 'Point'],
          ['!=', 'mode', 'static']
        ],
        'paint': {
          'circle-radius': 5,
          'circle-color': '#D20C0C'
        }
      },
      // stroke of each vertex you click as you're drawing the polygon - one by one until 'finished'
      {
        'id': 'gl-draw-polygon-and-line-vertex-inactive',
        'type': 'circle',
        'filter': ['all', ['==', 'meta', 'vertex'],
          ['==', '$type', 'Point'],
          ['!=', 'mode', 'static']
        ],
        'paint': {
          'circle-radius': 3,
          'circle-color': '#ffffff'
        }
      },
    ];

    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      styles: customStyle,
    });
    document.getElementById('catalog-draw-container').appendChild(this.draw.onAdd(this.map));

    this.geocoder = new GeoCoder({
      accessToken: this.accessToken,
      placeholder: 'SEARCH GEOGRAPHY ON MAP',
    });
    this.map.addControl(this.geocoder);

    this.map.on('load', () => {
      this.map.addSource('int-polygons', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [ ],
        },
      });

    });


    this.map.on('draw.create', (e) => {
      this.drawnPolygons = this.draw.getAll();
      // console.log(this.drawnPolygons);
      const bbox = T.bbox(this.drawnPolygons);

      // add extra buffer around bounding box
      const newBbox = [];
      for (let i = 0; i < bbox.length; i++) {
        if (i === 1 || i === 2) {
          newBbox.push(bbox[i] - 10);
        } else {
          newBbox.push(bbox[i] + 10);
        }
      }
      this.map.fitBounds(newBbox as M.LngLatBoundsLike);
    });

    this.map.on('draw.update', () => {
      this.drawnPolygons = this.draw.getAll();

      // TODO: Change 'view results' button text/color to 'update results'
      // TODO: Clear old data

      this.resultsButtonText = 'UPDATE RESULTS';
      this.buttonType = 'warn';

      this.intersectedPolygons = [];
      // console.log('on update:', this.intersectedPolygons);
      // this.dataSource = [];
      this.selection = new SelectionModel<any>(true, []);






    });

    this.map.on('draw.delete', () => {
      // reset all values when a drawn polygon is deleted
      this.drawnPolygons = null;
      this.viewResults = false;
      this.intersectedPolygons = [];
      this.dataSource = [];
      this.map.removeLayer('int-polygons');
      this.selection = new SelectionModel<any>(true, []);
      this.form.setValue({
        domain: null,
        mode: null,
        resolution: null,
        angle: null,
      });

    });
  }

  onViewResults() {
    // console.log('clicked');
    this.viewResults = true;

    // console.log(this.drawnPolygons.features[0].geometry);

    IMAGE_FOOTPRINTS_EGY.features.forEach(feature  => {
      const intersect = T.intersect(feature.geometry, this.drawnPolygons.features[0].geometry);
      console.log(intersect);
      if (intersect) {
        intersect.properties = feature.properties;  // save geojson properties in new array of intersected polygons
        // this.dataSource.push(intersect.properties.id);
        this.intersectedPolygons.push(intersect);
        console.log(this.intersectedPolygons);

        // console.log(intersect.properties.id);

        this.dataSource.push({
          id: intersect.properties.id,
          domain: this.form.value.domain,
          mode: this.form.value.mode,
          resolution: this.form.value.resolution,
          angle: this.form.value.angle,
        });

        // console.log(this.dataSource);
        // console.log('---------');
      }
    });

    const intGeojson = this.map.getSource('int-polygons') as M.GeoJSONSource;
    intGeojson.setData({ type: 'FeatureCollection', features: this.intersectedPolygons });
  }


  unionPolygons() {
    IMAGE_FOOTPRINTS_EGY.features.forEach(feature  => {
      const union = T.union(feature as T.Feature<T.Polygon>, this.drawnPolygons.features[0]);
      if (union) {
        this.intersectedPolygons.push(union);
      }
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.forEach(row => {
        this.selection.select(row);
        // console.log(this.selection);
        // console.log('doot');
      });
  }

  onClick() {
    setTimeout(() => {
      const array = [];
      const selected = this.selection.selected;

      selected.forEach(row => {
        array.push(row.id);
        // if (!this.map.getLayer(row.id)) {
        //   this.map.addLayer({
        //     id: row.id,
        //     type: 'fill',
        //     source: 'int-polygons',
        //     paint: {
        //       'fill-color': '#404041',
        //       'fill-opacity': 0.6,
        //     },
        //     filter: ['==', 'id', row.id],
        //   });
        // }
      });

      if (!array.length) {
        this.map.removeLayer('int-polygons');
      } else {
        // add newly selected points to the map
        this.map.addLayer({
          id: 'int-polygons',
          type: 'fill',
          source: 'int-polygons',
          paint: {
            'fill-color': '#404041',
            'fill-opacity': 0.6,
          },
        });
        this.map.setFilter('int-polygons', ['match', ['get', 'id'], array, true, false]);
      }
    }, 0);
  }
}
