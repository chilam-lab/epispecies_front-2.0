import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from './mapService';
import Swal from 'sweetalert2';

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

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  private initializeMap(): void {
    // Initialize the map

    this.map = L.map('map').setView([ 25, -102 ], 5);

    this.map.touchZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.boxZoom.disable();
    this.map.keyboard.disable();
    this.map.scrollWheelZoom.disable();
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }
  ngOnInit(){
    this.mapService.getStates(18)//TODO
      .subscribe({
        next: (response) => {
          console.log(JSON.stringify(response));
          Swal.fire({
            timer: 1100,
            title: 'Datos cargados correctamente.',
            icon: 'success'
          })
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          Swal.fire({
            timer: 1000,
            title: 'Ocurrio un error al cargar los datos.',
            icon: 'error'
          })
        }
      });
  }
  onclick(){
    
  }
}
