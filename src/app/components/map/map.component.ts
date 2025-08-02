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
  @Input() dataByMunToDisplayInMap: [number, string, string][] = [];
  @Input() selectedCVEState: number = 0;
  @Input() selectedCVEMun: string = "";
  @Input() statesAndMunList: any = [];
  constructor(private mapService: MapService) { }
  geoJsonLayerMunicipal: any;
  geoJsonLayerStates: any;
  currentGeoJsonLayer: L.GeoJSON | undefined;
  selectedResolution: string = environment.placeholderStateResolution;
  rawDataTodisplayByMun: [number, string, string][] = [];
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
    if (!this.map) return;

    let geoJson;
    if (isStateOrMunicipality === 'Municipal') { geoJson = this.geoJsonLayerMunicipal; }
    else { geoJson = this.geoJsonLayerStates };
    if (isStateOrMunicipality === 'Municipal') {
      //un minucupio
      if (this.selectedCVEMun.length > 0) {
        const filteredFeatures = geoJson.features.filter((feature: { properties: { cellid: number; clave: string; }; }) =>
          feature.properties.clave === this.selectedCVEMun.toString()
        );
        geoJson = {
          type: "FeatureCollection",
          features: filteredFeatures
        };
      } else {
        if(this.selectedCVEState !=0 ){
          let list = this.statesAndMunList.filter((item: any[]) => item[0] === this.selectedCVEState)
          let municipalityCodes = list.map((item: any[]) => Number(item[2]) > 10000 ? item[2] : "0" + item[2]);
          //los municipios del estado
          //traer la lista de los municipios e iterarla
          let filteredFeatures = geoJson.features.filter((feature: { properties: { cellid: number; clave: string; }; }) =>
            municipalityCodes.includes(feature.properties.clave)
          );
          geoJson = {
            type: "FeatureCollection",
            features: filteredFeatures
          };

        }
      }
    } else {
      console.log("this part is working fine")
      if (this.selectedCVEState > 0) {
        const filteredFeatures = geoJson.features.filter((feature: { properties: { cellid: number; clave: string; }; }) =>
          feature.properties.cellid === this.selectedCVEState
        );
        geoJson = {
          type: "FeatureCollection",
          features: filteredFeatures
        };
      }
    }



    console.log('GeoJSON:', geoJson);
    if (this.currentGeoJsonLayer) {
      this.map.removeLayer(this.currentGeoJsonLayer);
      this.currentGeoJsonLayer = undefined;
    }

    this.currentGeoJsonLayer = L.geoJSON(geoJson, {
      style: (feature: any | undefined) => {
        if (feature?.properties) {
          const fillColor = this.getColorForValue(this.updateData(feature.properties.clave)) || '#ffffff';
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
          layer.bindTooltip(`Clave: ${feature.properties.clave} heelo: ${this.updateData(feature.properties.clave)}`, { sticky: true });
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

  selectedRegion(isStateOrMunicipality: string, geoJson: { features: any; type?: string; }) {

  }

  updateData(id: string): number {
    if (this.selectedResolution === 'Municipal') {
      let sum = Number(this.dataByMunToDisplayInMap.filter(item => item[1] === id)[0][2])
      return sum;
    }
    else {
      const sum = this.dataByMunToDisplayInMap
        .filter(item => item[0] === Number(id))
        .reduce((sum, item) => sum + Number(item[2]), 0);
      return sum;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes)
    try {
      let newResolution = changes['updatedResolution']['currentValue'];
      if (newResolution && newResolution != this.selectedResolution) {
        this.selectedResolution = newResolution;
      }
    } catch (err) {
      console.log("no resolution updates");
    }
    try {
      let dataToDisplayByMun = changes['dataByMunToDisplayInMap']['currentValue'];
      if (dataToDisplayByMun.length != 0 && dataToDisplayByMun != this.rawDataTodisplayByMun) {
        this.rawDataTodisplayByMun = dataToDisplayByMun;
        // Calculate the maximum value for the dynamic range
        let maxValue = 0;

        console.log('Max value:', maxValue);
        for (const row of this.rawDataTodisplayByMun) {
          const value = row[2];
          if (typeof value === 'number' && value > maxValue) {
            maxValue = value;
          }
        }
        this.highestValueInData = maxValue;
      }

    } catch (err) {
      console.log("no updates in the data")
    }
    if (this.selectedResolution != 'Municipal') {
      console.log("La updateData:")
      console.log(this.updateData("5"))
    }
    this.updateMapLayerView(this.selectedResolution);
  }

  getColorForValue(value: number): string {
    let maxValue = this.highestValueInData;
    console.log("el value value")
    console.log(value)
    console.log("el max number")
    console.log(maxValue)

    if (maxValue === 0) return '#3388ff'; // Avoid division by zero

    // Define quintiles (5 equal parts)
    const q_1 = maxValue * (1.0 / 5.0);
    const q_2 = maxValue * (2.0 / 5.0);
    const q_3 = maxValue * (3.0 / 5.0);
    const q_4 = maxValue * (4.0 / 5.0);
    const q_5 = maxValue * (5.0 / 5.0);

    // Define color ranges based on quintiles
    if (value > q_4) return '#800026';      // Top quintile (80-100%)
    if (value > q_3) return '#BD0026';      // Fourth quintile (60-80%)
    if (value > q_2) return '#E31A1C';      // Third quintile (40-60%)
    if (value > q_1) return '#FC4E2A';      // Second quintile (20-40%)
    if (value == 0) return '#FFEDA0';      // Zero quintile (20-40%)
    return '#FD8D3C';                       // Bottom quintile (0-20%)
  }

}
