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
  constructor(private mapService: MapService) { }
  geoJson: any = {};

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
  async ngOnInit() {
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
    const latitudeOffset = 12; // Adjust this for vertical position (North/South)
const longitudeOffset = -22; // Adjust this for horizontal position (East/West).
                            // Negative moves left (West), Positive moves right (East)

this.geoJson.features.forEach((feature: { geometry: { type: string; coordinates: any[]; }; }) => {
    if (feature.geometry && feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach((polygon: any[]) => {
            polygon.forEach((ring: any[]) => {
                ring.forEach((coordinate: number[]) => {
                    // Apply the latitude offset (for North/South adjustment)
                    coordinate[1] = coordinate[1] + latitudeOffset;

                    // Apply the longitude offset (for East/West adjustment)
                    // Subtracting moves it to the left (West)
                    // Adding would move it to the right (East)
                    coordinate[0] = coordinate[0] + longitudeOffset; // Change from previous suggestion to be explicit
                });
            });
        });
    }
    // Handle 'Polygon' features if you have them, with the same longitude adjustment
    // else if (feature.geometry && feature.geometry.type === 'Polygon') {
    //     feature.geometry.coordinates.forEach(ring => {
    //         ring.forEach(coordinate => {
    //             coordinate[1] = coordinate[1] + latitudeOffset;
    //             coordinate[0] = coordinate[0] + longitudeOffset; // Add this line
    //         });
    //     });
    // }
});





    this.map = L.map('map').setView([ 25, -102 ], 1);;

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


  }
  onclick() {

  }
}
