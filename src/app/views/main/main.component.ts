// src/app/views/main/main.component.ts
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { MapComponent } from '../../components/map/map.component';
import { DiseaseDbService } from '../../services/disease-db.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SicknessGroupList, SicknessKey } from '../../models/sickness-group-list';

@Component({
  selector: 'app-main',
  imports: [MapComponent, CommonModule, FormsModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
  standalone: true
})
export class MainComponent implements OnInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  constructor(private dbService: DiseaseDbService) { }
  sicknessList: any[] = [];
  selectedSickness: string = "Selecciona una opción";
  groupList: any[] = [];

  ngOnInit() {
    this.dbService.getDisease('cve_enfermedad', 'enfermedad')
      .subscribe({
        next: (response) => {
          this.sicknessList = response;
          console.log(JSON.stringify(this.sicknessList));
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
  }
  onSicknessChange(sicknessNumber: SicknessKey) {
    this.groupList = SicknessGroupList[sicknessNumber]
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