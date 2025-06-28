import { Component, OnInit, SimpleChanges, Input } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from './mapService';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-map',
  imports: [],
  standalone: true,
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit {
  private map: L.Map | undefined;
  @Input() updatedResolution: string = "";
  @Input() munDataToDisplayInMap: [number, number, string][] = [];
  constructor(private mapService: MapService) { }
  geoJsonLayerMunicipal: any;
  geoJsonLayerStates: any;
  currentGeoJsonLayer: L.GeoJSON | undefined;
  selectedResolution: string = environment.placeholderStateResolution;
  rawDataTodisplayInMap: [number, number, string][] = [];
  highestValueInData = 0;

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  private initializeMap(): void { }

  async ngOnInit() {
    const statesGeoJson = await firstValueFrom(this.mapService.getStates(17));
    const municiapalGeoJson = await firstValueFrom(this.mapService.getStates(18));
    this.geoJsonLayerStates = statesGeoJson.json;
    this.geoJsonLayerMunicipal = municiapalGeoJson.json;
    this.map = L.map('map').setView([11.87, -81.58], 5);

    this.map.touchZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.boxZoom.disable();
    this.map.keyboard.disable();
    this.map.scrollWheelZoom.disable();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.updateMapLayerView("states");
  }
  onclick() {

  }

  updateMapLayerView(isStateOrMunicipality: string) {
    if (!this.map) {
      console.warn('Map is not initialized');
      return;
    }
    let geoJson;
    if (isStateOrMunicipality === 'Municipal') {
      geoJson = this.geoJsonLayerMunicipal;
    } else {
      geoJson = this.geoJsonLayerStates;
    }

    console.log('GeoJSON:', geoJson);
    if (this.currentGeoJsonLayer) {
      this.map.removeLayer(this.currentGeoJsonLayer);
      this.currentGeoJsonLayer = undefined;
    }

    this.currentGeoJsonLayer = L.geoJSON(geoJson, {
      style: (feature: any | undefined) => {
        if (feature?.properties) {
          const fillColor = this.getColorForValue(this.updateData(feature.properties.cellid)) || '#ffffff';
          return {
            fillColor, // Now guaranteed to be a string
            weight: 2,
            opacity: 1,
            color: '#ffffff',
            fillOpacity: 0.7,
          };
        }
        return {
          fillColor: '#ffffff',
          weight: 2,
          opacity: 1,
          color: '#ffffff',
          fillOpacity: 0.7,
        };
      },

      onEachFeature: (feature, layer) => {  // Changed to arrow function
        if (feature.properties) {
          layer.bindPopup(
            `<b>Cell ID:</b> ${feature.properties.cellid}<br>` +
            `<b>Clave:</b> ${feature.properties.clave}`
          );
          layer.bindTooltip(`Clave: ${feature.properties.clave} heelo: ${this.updateData(feature.properties.cellid)}`, { sticky: true });
        }
      },
    }).addTo(this.map);

    const bounds = this.currentGeoJsonLayer.getBounds();
    if (bounds.isValid()) {
      this.map.fitBounds(bounds);
    } else {
      this.map.setView([11.87, -81.58], 5);
    }
  }

  updateData(id: number) {
    if (this.selectedResolution === 'Municipal') {
      const sum = this.munDataToDisplayInMap
        .filter(item => item[1] === id)
        .reduce((sum, item) => sum + Number(item[2]), 0);
      return sum;
    }
    else {

      const sum = this.munDataToDisplayInMap
        .filter(item => item[0] === id)
        .reduce((sum, item) => sum + Number(item[2]), 0);
      return sum;
    }

  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes)
    try {
      let newResolution = changes['updatedResolution']['currentValue'];
      if (newResolution && newResolution != this.selectedResolution) {

        console.log("Dentro de la nuevaresolucion")
        this.selectedResolution = newResolution;

      }
      console.log("newResolution")
      console.log(newResolution)
      console.log(newResolution != this.selectedResolution)
      console.log("newResolution")

    } catch (err) {
      console.log("no resolution updates");
    }
    try {
      let newDataToDisplay = changes['munDataToDisplayInMap']['currentValue'];

      console.log("newDataToDisplay1111")
      console.log(newDataToDisplay)
      console.log(this.rawDataTodisplayInMap)
      console.log(newDataToDisplay !== this.rawDataTodisplayInMap)
      console.log("newDataToDisplay1111")
      if (newDataToDisplay.length != 0 && newDataToDisplay != this.rawDataTodisplayInMap) {
        console.log("Updates dentro de los datos")
        this.rawDataTodisplayInMap = newDataToDisplay;
        // Calculate the maximum value for the dynamic range
        let maxValue = 0;

        console.log('Max value:', maxValue);
        for (const row of this.rawDataTodisplayInMap) {
          const value = row[2];
          if (typeof value === 'number' && value > maxValue) {
            maxValue = value;
          }
        }
        this.highestValueInData = maxValue;
      }
      console.log("no updates in the data")
      console.log(this.rawDataTodisplayInMap.length)
      console.log("no updates in the data")
    } catch (err) {
      console.log("no updates in the data")
    }
    console.log("La l:")
    console.log("La updateData:")
    console.log(this.updateData(5))
    console.log(this.munDataToDisplayInMap.filter(item => item[0] === 5))
    console.log("La updateData:")

    // munDataToDisplayInMap
    // statesData = [];
    // municipalityData = [];
    this.updateMapLayerView(this.selectedResolution);
  }

  getColorForValue(value: number): string {
    let maxValue = this.highestValueInData;
    console.log("el value value")
    console.log(value)
    console.log("el max number")
    console.log(maxValue)
    if (maxValue === 0) return '#3388ff'; // Avoid division by zero

    // Define thresholds as fractions of maxValue
    const thresholds = [
      { limit: 0.8 * maxValue, color: '#faf7b2' }, // Red for top 20%
      { limit: 0.6 * maxValue, color: '#6a0000' }, // Orange for 60-80%
      { limit: 0.4 * maxValue, color: '#d50000' }, // Yellow for 40-60%
      { limit: 0.2 * maxValue, color: '#ffc455' }, // Green for 20-40%
      { limit: 0, color: '#89e6ff' },              // Cyan for 0-20%
    ];

    for (const threshold of thresholds) {
      if (value > threshold.limit) {
        return threshold.color;
      }
    }
    return '#3388ff'; // Fallback color
  }

}
