// src/app/views/main/main.component.ts
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { MapComponent } from '../../components/map/map.component';
import { DiseaseDbService } from '../../services/disease-db.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SicknessGroupList, SicknessKey } from '../../models/sickness-group-list';
import Swal from 'sweetalert2';
import { MatIconModule } from '@angular/material/icon';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ApiResponse, CVEGrupoAndCausa, CausaDescription} from '../../models/cve_list';

@Component({
  selector: 'app-main',
  imports: [MapComponent, CommonModule, FormsModule, MatIconModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
  standalone: true,

})

export class MainComponent implements OnInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  constructor(private dbService: DiseaseDbService) { }
  sicknessList: any[] = [];
  selectedSickness: string = "Selecciona una opción";
  selectedGroupClass: string = "Selecciona una opción";
  selectedCauseDeathClass: string = "Selecciona una opción";
  groupList: any[] = [];
  groupSelectDisable = true;
  causeDeathSelectDisable = true;
  activeTabInMap: string = 'tab1';
  listOfCVE_GrupoAndCVE_Causa_def: CVEGrupoAndCausa[] = [];
  listofCausa_defDescription: CausaDescription[] = [];

  ngOnInit() {
    Swal.fire({
      title: 'Cargando datos...',
      allowOutsideClick: false,
      showConfirmButton: true,
    })
    Swal.showLoading();
    this.dbService.getDisease('CVE_Enfermedad', 'Enfermedad')
      .subscribe({
        next: (response) => {
          this.sicknessList = response.sort((a: string[], b: string[]) => a[1].localeCompare(b[1]));
          console.log(JSON.stringify(this.sicknessList));
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
      this.loadingThirdGroupSelector()
  }
  onSicknessChange(sicknessNumber: SicknessKey) {
    this.groupList = SicknessGroupList[sicknessNumber].sort((a, b) => a.localeCompare(b, 'es'));
    this.resetAllClassSelects();
  }

  onGroupClassChange(event: any) {

  }

  onCauseDeathChange(event: any) {
    //we don't need
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
  resetAllClassSelects() {
    this.selectedGroupClass = "Selecciona una opción";
    this.selectedCauseDeathClass = "Selecciona una opción";
    this.groupSelectDisable = true;
    this.causeDeathSelectDisable = true;
  }

  resetClassSelectBy(numberLevel: number) {
    if (numberLevel == 2) {
      this.selectedGroupClass = "Selecciona una opción";
      this.selectedCauseDeathClass = "Selecciona una opción";
      this.groupSelectDisable = true;
      this.causeDeathSelectDisable = true;
    }
    if (numberLevel == 3) {
      this.selectedCauseDeathClass = "Selecciona una opción";
      this.causeDeathSelectDisable = true;
    }
  }
  showNextLevel(level: number) {
    if (level === 2) {
      this.groupSelectDisable = false;
    }
    if (level == 3) {
      this.causeDeathSelectDisable = false;
    }
  }
  setActiveTabInMap(tab: string) {
    this.activeTabInMap = tab;
  }

  loadingThirdGroupSelector() {
    const request = [["CVE_Grupo", "CVE_Causa_def"], ["CVE_Causa_def", "Causa_def"]]
    this.dbService.getUniqueColumns(request).subscribe({
      next: (responses: ApiResponse[]) => {
        const response = responses[0];
        this.listOfCVE_GrupoAndCVE_Causa_def = response[0];
        this.listofCausa_defDescription = response[1];
        console.log(JSON.stringify(response));
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
}