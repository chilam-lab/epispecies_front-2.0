import { Component, OnInit, SimpleChanges, Input } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from './mapService';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-map',
  imports: [],
  standalone: true,
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit{
  private map: L.Map | undefined;
  @Input() resolution = "";
  constructor(private mapService: MapService) { }
  geoJsonLayerMunicipal: any; // Replace 'any' with your GeoJSON type
  geoJsonLayerStates: any; // Replace 'any' with your GeoJSON type
  currentGeoJsonLayer: L.GeoJSON | undefined;
  

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

    // Disable map interactions
    this.map.touchZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.boxZoom.disable();
    this.map.keyboard.disable();
    this.map.scrollWheelZoom.disable();

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    // Initial layer load (optional, e.g., municipal by default)
    this.updateMapLayerView("states");
  }
  onclick() {

  }
  updateMapLayerView(isStateOrMunicipality: string){
    if (!this.map) {
      console.error('Map is not initialized');
      return;
    }

    let geoJson;
    if (isStateOrMunicipality === 'municipal') {
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
      style: function (feature) {
        return {
          fillColor: '#3388ff',
          weight: 2,
          opacity: 1,
          color: '#ffffff',
          fillOpacity: 0.7,
        };
      },
      onEachFeature: function (feature, layer) {
        if (feature.properties) {
          layer.bindPopup(
            `<b>Cell ID:</b> ${feature.properties.cellid}<br>` +
            `<b>Clave:</b> ${feature.properties.clave}`
          );
          layer.bindTooltip(`Clave: ${feature.properties.clave}`, { sticky: true });
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
  ngOnChanges(changes: SimpleChanges): void {
    console.log("hubo un cambio")
    console.log(changes)
    console.log("hubo un cambio")
    this.updateMapLayerView("municipal")
  }
}
