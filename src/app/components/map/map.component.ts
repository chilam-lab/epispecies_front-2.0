import { Component, OnInit } from '@angular/core';
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
export class MapComponent implements OnInit {
  private map: L.Map | undefined;
  constructor(private mapService:MapService){}
  geoJson:any = {};

  ngAfterViewInit(): void {
    this.initializeMap();
  }

   private initializeMap(): void {
    // Initialize the map
  

    // this.map = L.map('map').setView([ 25, -102 ], 5);

    // this.map.touchZoom.disable();
    // this.map.doubleClickZoom.disable();
    // this.map.boxZoom.disable();
    // this.map.keyboard.disable();
    // this.map.scrollWheelZoom.disable();
    // // Add OpenStreetMap tiles
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   maxZoom: 19,
    //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(this.map);

    // console.log("hello")
    // L.geoJSON(this.geoJson, {
    //         // Style the polygons
    //         style: function (feature) {
    //             return {
    //                 fillColor: '#3388ff', // Fill color for polygons
    //                 weight: 2,            // Border thickness
    //                 opacity: 1,           // Border opacity
    //                 color: '#ffffff',     // Border color
    //                 fillOpacity: 0.7      // Fill opacity
    //             };
    //         },
    //         // Add popups or tooltips for each feature
    //         onEachFeature: function (feature, layer) {
    //             if (feature.properties) {
    //                 // Create a popup with cellid and clave
    //                 layer.bindPopup(
    //                     `<b>Cell ID:</b> ${feature.properties.cellid}<br>` +
    //                     `<b>Clave:</b> ${feature.properties.clave}`
    //                 );
    //                 // Optional: Add tooltip
    //                 layer.bindTooltip(`Clave: ${feature.properties.clave}`, { sticky: true });
    //             }
    //         }
    //     }).addTo(this.map);
    //     let geojsonLayer = L.geoJSON(this.geoJson).addTo(this.map);
    //     this.map.fitBounds(geojsonLayer.getBounds());
        console.log("meow 😱")
  }
  async ngOnInit(){
    // this.mapService.getStates(18)//TODO
    //   .subscribe({
    //     next: (response) => {
    //       console.log(JSON.stringify(response));
    //       this.geoJson = response.json
    //       console.log(this.geoJson);
    //       Swal.fire({
    //         timer: 1100,
    //         title: 'Datos cargados correctamente.',
    //         icon: 'success'
    //       })
    //     },
    //     error: (error) => {
    //       console.error('Error fetching data:', error);
    //       Swal.fire({
    //         timer: 1000,
    //         title: 'Ocurrio un error al cargar los datos.',
    //         icon: 'error'
    //       })
    //     }
    //   });
    const response = await firstValueFrom(this.mapService.getStates(18));
    this.geoJson = response.json;
    console.log(this.geoJson);
    this.map = L.map('map').setView([11.87, -81.58], 5);

    this.map.touchZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.boxZoom.disable();
    this.map.keyboard.disable();
    this.map.scrollWheelZoom.disable();
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    console.log("hello")
    const geojsonLayer = L.geoJSON(this.geoJson, {
            // Style the polygons
            style: function (feature) {
                return {
                    fillColor: '#3388ff', // Fill color for polygons
                    weight: 2,            // Border thickness
                    opacity: 1,           // Border opacity
                    color: '#ffffff',     // Border color
                    fillOpacity: 0.7      // Fill opacity
                };
            },
            // Add popups or tooltips for each feature
            onEachFeature: function (feature, layer) {
                if (feature.properties) {
                    // Create a popup with cellid and clave
                    layer.bindPopup(
                        `<b>Cell ID:</b> ${feature.properties.cellid}<br>` +
                        `<b>Clave:</b> ${feature.properties.clave}`
                    );
                    // Optional: Add tooltip
                    layer.bindTooltip(`Clave: ${feature.properties.clave}`, { sticky: true });
                }
            }
        }).addTo(this.map);
//         const bounds = geojsonLayer.getBounds();
// const center = bounds.getCenter(); // Approx. [11.87, -81.58]
// this.map.setView(center, 5);
        console.log(geojsonLayer.getBounds());
        const tijuanaFeature = this.geoJson.features.find((f: { properties: { clave: string; }; }) => f.properties.clave === "02");
    if (tijuanaFeature) {
        const tijuanaLayer = L.geoJSON(tijuanaFeature);
        this.map.fitBounds(tijuanaLayer.getBounds());
        console.log("Tijuana bounds:", tijuanaLayer.getBounds());
    } else {
        console.error("Tijuana feature (clave: '02') not found");
        this.map.fitBounds(geojsonLayer.getBounds()); // Fallback to all polygons
    }
  }
  onclick(){
    
  }
}
