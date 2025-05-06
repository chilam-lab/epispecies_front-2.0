// src/app/views/main/main.component.ts
import { Component, ViewChild, ElementRef, OnInit, HostListener } from '@angular/core';
import { MapComponent } from '../../components/map/map.component';
import { DiseaseDbService } from '../../services/disease-db.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SicknessGroupList, SicknessKey } from '../../models/sickness-group-list';
import Swal from 'sweetalert2';
import { MatIconModule } from '@angular/material/icon';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ApiResponse, CVEGrupoAndCausa, CausaDescription } from '../../models/cve_list';

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
  scrollPosition = 0;
  windowHeight = window.innerHeight;
  sicknessList: any[] = [];
  selectedSickness: string = "Selecciona una opción";
  selectedGroupClass: string = "Selecciona una opción";
  selectedCauseDeathClass: string = "Selecciona una opción";
  groupList: any[] = [];
  groupSelectDisable = true;
  causeDeathSelectDisable = true;
  activeTabInMap: string = 'tab1';
  listOfThirdClass = [];
  selectedSicknessID = 0;
  selectedAge = "Selecciona una opción";
  selectedGender = "Selecciona una opción";
  selectedYear= "Selecciona una opción";
  selectedAgeList = [];
  selectedGenderList = [];
  selectedYearList = [];

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
      this.dbService.getUniqueValues('Edad_gpo')
      .subscribe({
        next: (response) => {
          this.selectedAgeList = response;
          console.log(JSON.stringify(this.selectedAgeList));
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
      this.dbService.getUniqueValues('Sexo')
      .subscribe({
        next: (response) => {
          this.selectedGenderList = response;
          console.log(JSON.stringify(this.selectedGenderList));
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
      this.dbService.getUniqueValues('Anio')
      .subscribe({
        next: (response) => {
          this.selectedYearList = response;
          console.log(JSON.stringify(this.selectedYearList));
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.scrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  get page1Opacity(): number {
    return Math.max(0, 1 - this.scrollPosition / (this.windowHeight * 0.7));
  }

  get page1Transform(): string {
    return `translateY(${-this.scrollPosition * 0.3}px)`;
  }

  onSicknessChange(sicknessNumber: SicknessKey) {
    let sickNumber = sicknessNumber.toString()
    this.selectedGroupClass = "Selecciona una opción";
    this.selectedCauseDeathClass = "Selecciona una opción";
    this.selectedSicknessID = sicknessNumber;
    Swal.fire({
      title: 'Cargando datos...',
      allowOutsideClick: false,
      showConfirmButton: true,
    })
    Swal.showLoading();
    this.dbService.getGroupList(sickNumber)
      .subscribe({
        next: (response) => {
          this.groupList = response
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

  onGroupClassChange(groupID: SicknessKey) {
    this.selectedCauseDeathClass = "Selecciona una opción";
    let sickId = this.selectedSicknessID.toString()
    let groupNumber = groupID.toString()
    Swal.fire({
      title: 'Cargando datos...',
      allowOutsideClick: false,
      showConfirmButton: true,
    })
    Swal.showLoading();
    this.dbService.getCauseDeathList(sickId, groupNumber)
      .subscribe({
        next: (response) => {
          this.listOfThirdClass = response
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
}