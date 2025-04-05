// src/app/views/main/main.component.ts
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { MapComponent } from '../../components/map/map.component';
import { DiseaseDbService } from '../../services/disease-db.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SicknessGroupList, SicknessKey } from '../../models/sickness-group-list';
import Swal from 'sweetalert2';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-main',
  imports: [MapComponent, CommonModule, FormsModule, MatIconModule],
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
  group1SelectDisable = true;
  group2SelectDisable = true;

  ngOnInit() {
    Swal.fire({
      title: 'Cargando datos...',
      allowOutsideClick: false,
      showConfirmButton: true,
    })
    Swal.showLoading();
    this.dbService.getDisease('cve_enfermedad', 'enfermedad')
      .subscribe({
        next: (response) => {
          this.sicknessList = response.sort((a: { Enfermedad: string; }, b: { Enfermedad: string; }) => {
            return a.Enfermedad.localeCompare(b.Enfermedad);
          });
          console.log(JSON.stringify(this.sicknessList));
          Swal.fire({
            timer: 1100,
            title:  'Datos cargados correctamente.',
              icon:  'success'
          })
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          Swal.fire({
            timer: 1000,
            title:  'Ocurrio un error al cargar los datos.',
              icon:  'error'
          })
        }
      });
  }
  onSicknessChange(sicknessNumber: SicknessKey) {
    this.groupList = SicknessGroupList[sicknessNumber].sort((a, b) => a.localeCompare(b, 'es'));
    this.group1SelectDisable = false;
  }
  clearSubgroupSelection(event: any) {
    console.log(event)
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