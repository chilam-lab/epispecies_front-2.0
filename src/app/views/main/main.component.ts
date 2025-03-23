// src/app/views/main/main.component.ts
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { MapComponent } from '../../components/map/map.component';
import { DiseaseDbService } from '../../services/disease-db.service';

@Component({
  selector: 'app-main',
  imports: [MapComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
  standalone: true
})
export class MainComponent implements OnInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  constructor(private dbService: DiseaseDbService) { }
  data: any;

  ngOnInit() {
    this.dbService.getDisease('cve_enfermedad', 'enfermedad')
      .subscribe({
        next: (response) => {
          this.data = response;
          console.log("Se logro :)");
          console.log(JSON.stringify(this.data));
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
  }
  
  showAndScrollToMap() {
    this.mapContainer.nativeElement.classList.add('visible');
    setTimeout(() => {
      this.mapContainer.nativeElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 700);
  } 
}