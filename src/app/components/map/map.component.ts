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
  cleanDataToDisplay:[number, number][] = [];

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
    let newa: { stateCounts: [number, number][], municipalCounts: [number, number][] } = this.groupByStateAndMunicipal();
    if (isStateOrMunicipality === 'Municipal') { 
      geoJson = this.geoJsonLayerMunicipal;
      
      this.cleanDataToDisplay = newa["municipalCounts"];
    } else {
        geoJson = this.geoJsonLayerStates;
      this.cleanDataToDisplay = newa["stateCounts"];
    }

    console.log('GeoJSON:', geoJson);
    if (this.currentGeoJsonLayer) {
      this.map.removeLayer(this.currentGeoJsonLayer);
      this.currentGeoJsonLayer = undefined;
    }

    this.currentGeoJsonLayer = L.geoJSON(geoJson, {
      style: (feature) => {  // Changed to arrow function
        return {
          fillColor: '#3388ff',
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
          layer.bindTooltip(`Clave: ${feature.properties.clave} heelo: ${this.updateData(Number(feature.properties.clave))}`, { sticky: true });
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
    return this.cleanDataToDisplay.filter((record) => record[0] === id)[0][1];
  }

  filterAndCountData() {
    const stateMap = new Map();
    const municipalMap = new Map();
    const uniqueValues = [...new Set(this.rawDataTodisplayInMap.map(item => item[0]))];
    console.log("aaajdjjdj")
    console.log(uniqueValues)
    console.log(uniqueValues)
    console.log("aaajdjjdj")



    this.rawDataTodisplayInMap.forEach((item: any[]) => {
      const stateId = item[0];
      const municipalId = item[1];




      // Count states
      stateMap.set(stateId, (stateMap.get(stateId) || 0) + 1);

      // Count municipalities  
      municipalMap.set(municipalId, (municipalMap.get(municipalId) || 0) + 1);
    });

    // Convert Maps to arrays
    const stateResult = Array.from(stateMap.entries());
    const municipalResult = Array.from(municipalMap.entries());


    return { stateResult, municipalResult };
  }


  groupByStateAndMunicipal(): { stateCounts: [number, number][], municipalCounts: [number, number][] } {
    // Create maps to store counts
    const stateMap = new Map<number, number>();
    const municipalMap = new Map<number, number>();
    
    // Count occurrences
    this.rawDataTodisplayInMap.forEach(([idState, idMunicipal, _description]) => {
        stateMap.set(idState, (stateMap.get(idState) || 0) + 1);
        municipalMap.set(idMunicipal, (municipalMap.get(idMunicipal) || 0) + 1);
    });
    
    // Convert maps to desired array format
    const stateCounts: [number, number][] = Array.from(stateMap.entries());
    const municipalCounts: [number, number][] = Array.from(municipalMap.entries());
    
        console.log("aaaaaaaSUM")
    console.log(JSON.stringify(stateCounts))
    console.log(JSON.stringify(municipalCounts))
    console.log("aaaaaaaSUM")
    return { stateCounts, municipalCounts };
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
      }
    } catch (err) {
      console.log("no updates in the data")
    }
    console.log("La l:")
    console.log("La munDataToDisplayInMap:")
    console.log(this.munDataToDisplayInMap)

    // munDataToDisplayInMap
    // statesData = [];
    // municipalityData = [];
    this.updateMapLayerView(this.selectedResolution);
  }

}
