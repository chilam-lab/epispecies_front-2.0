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
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-main',
  imports: [MapComponent, CommonModule, FormsModule, MatIconModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
  standalone: true,

})

export class MainComponent implements OnInit {

  constructor(private dbService: DiseaseDbService) { }
  env = environment;
  selectedFirstClassId: string = environment.placeholderFirstClass;
  selectedSecondClassId: string = environment.placeholderSecondClass;
  selectedThirdClassId: string = environment.placeholderThirdClass;
  selectedAge: string = environment.placeholderAge;
  selectedGender:string  = environment.placeholderGender;
  selectedYear: string = environment.placeholderYear;
  firstClassList: any[] = [];
  secondClassList: any[] = [];
  thirdClassList = [];
  secondClassSelectDisable = true;
  thirdClassSelectDisable = true;
  agesList = [];
  gendersList = [];
  yearsList = [];
  TEST = [];
  statesMun = []
  countValuesInEdo: Record<number, number> = {}
  displayData: any = [];
  selectedRegion:string ="País";
  selectedResolution:string ="Estatal";
  updatedRegion:string ="País";
  updatedResolution:string ="Estatal";
  gendersDict = {1:"Hombres",2:"Mujeres",9:"Otro"}

  ngOnInit() {
    Swal.fire({
      title: 'Cargando datos...',
      allowOutsideClick: false,
      showConfirmButton: true,
    })
    Swal.showLoading();
    this.dbService.getDisease('CVE_Enfermedad', 'Enfermedad', 'RAWDATA')//TODO
      .subscribe({
        next: (response) => {
          this.firstClassList = response.sort((a: string[], b: string[]) => a[1].localeCompare(b[1]));
          console.log(JSON.stringify(this.firstClassList));
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
    this.dbService.getUniqueValues(['Edad_gpo', 'Sexo', 'Anio'])
      .subscribe({
        next: (response) => {
          this.agesList = response[0];
          this.gendersList = response[1];
          this.yearsList = response[2].reverse();
          console.log(JSON.stringify(this.gendersList));
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
    this.dbService.getAllFrom('ESTADO_MUN')
      .subscribe({
        next: (response) => {
          this.statesMun = response;
          console.log(JSON.stringify(this.gendersList));
          const stateMap = new Map<number, string>();
          this.statesMun.forEach(row => {
            stateMap.set(row[0], row[1]);
          });

          // Convert counts to array for display
          this.displayData = Object.entries(this.countValuesInEdo).map(([id, count]) => ({
            id: Number(id),
            name: stateMap.get(Number(id)) || `State ${id}`,
            count
          }));
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
  }

  onSicknessChange(sicknessNumber: SicknessKey) {
    console.log("weel")
    console.log(this.firstClassList)
    console.log("weel")
    console.log(this.secondClassList)
    console.log(this.thirdClassList)
    let sickNumber = sicknessNumber.toString()
    this.selectedSecondClassId = environment.placeholderSecondClass;
    this.selectedThirdClassId = environment.placeholderThirdClass;
    Swal.fire({
      title: 'Cargando datos...',
      allowOutsideClick: false,
      showConfirmButton: true,
    })
    Swal.showLoading();
    this.dbService.getGroupList(sickNumber)
      .subscribe({
        next: (response) => {
          this.secondClassList = response
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
  getDescriptionByIdInAList(id: string, dataList: [string, string][]): string | null {
    const item = dataList.find((listId) => listId[0] == id);
    return item ? item[1] : null;
  }

  onGroupClassChange(groupID: SicknessKey) {
    this.selectedThirdClassId = environment.placeholderThirdClass;
    let sickId = this.selectedFirstClassId.toString()
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
          this.thirdClassList = response
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
  onRunModel() {
    Swal.fire({
      title: 'Cargando datos...',
      allowOutsideClick: false,
      showConfirmButton: true,
    })
    Swal.showLoading();
    this.dbService.getDataByYear("2019", this.selectedFirstClassId.toString())
      .subscribe({
        next: (response) => {
          this.TEST = response
          this.countValuesInEdo = this.countValuesInEighthPosition(response);
          console.log("Counts of values in the 8th position (1 to 32):");
          for (let i = 1; i <= 32; i++) {
            console.log(`Value ${i}: ${this.countValuesInEdo[i]}`);
          }
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

  clearSubgroupSelection(event: any) {
    console.log(event)
  }

  resetAllClassSelects() {
    this.selectedSecondClassId = environment.placeholderSecondClass;
    this.selectedThirdClassId = environment.placeholderThirdClass;
    this.secondClassSelectDisable = true;
    this.thirdClassSelectDisable = true;
  }

  resetClassSelectBy(numberLevel: number) {
    if (numberLevel == 2) {
      this.selectedSecondClassId = environment.placeholderSecondClass;
      this.selectedThirdClassId = environment.placeholderThirdClass;
      this.secondClassSelectDisable = true;
      this.thirdClassSelectDisable = true;
    }
    if (numberLevel == 3) {
      this.selectedThirdClassId = environment.placeholderThirdClass;
      this.thirdClassSelectDisable = true;
    }
  }
  showNextLevel(level: number) {
    if (level === 2) {
      this.secondClassSelectDisable = false;
    }
    if (level == 3) {
      this.thirdClassSelectDisable = false;
    }
  }
  
  countValuesInEighthPosition(data: any[]): Record<number, number> {
    // Initialize an object to store counts for values 1 to 32
    const counts: Record<number, number> = {};
    for (let i = 1; i <= 32; i++) {
      counts[i] = 0;
    }
    console.log(counts)

    data.map(row => {
      const value = Number(row[3]); // Use index 7 for 8th position
      if (value >= 1 && value <= 32) {
        counts[value]++;
      }
    });

    return counts;
  }
  updateResolution() {
    //this.resolution = "nunicipal"
    this.selectedRegion
    this.updatedResolution = this.selectedResolution
  }
}