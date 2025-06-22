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
  selectedGender: string = environment.placeholderGender;
  selectedYear: string = environment.placeholderYear;
  firstClassList: any[] = [];
  secondClassList: any[] = [];
  thirdClassList = [];
  secondClassSelectDisable = true;
  thirdClassSelectDisable = true;
  agesList = [];
  gendersList = [];
  yearsList = [];
  statesMun = []
  countValuesInEdo: Record<number, number> = {}
  displayData: any = [];
  selectedRegion: string = "País";
  selectedResolution: string = "Estatal";
  updatedRegion: string = "País";
  updatedResolution: string = "Estatal";
  gendersDict = { 1: "Hombres", 2: "Mujeres", 9: "Otro" }
  notification = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  ngOnInit() {
    Swal.fire({
      title: 'Cargando datos...',
      allowOutsideClick: false,
      showConfirmButton: true,
    })
    Swal.showLoading();
    this.dbService.uniquePairColumns('CVE_Enfermedad', 'Enfermedad', 'ENFERMEDADES')
      .subscribe({
        next: (response) => {
          this.firstClassList = response;
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
          const lastyear = response[2].pop();
          this.yearsList = response[2].reverse();
          this.selectedYear = lastyear;
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
          Swal.fire({
            timer: 1100,
            title: 'Datos cargados correctamente.',
            icon: 'success'
          })
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
  }




  onFirstClassChange(firstClassId: string) {
    this.selectedSecondClassId = environment.placeholderSecondClass;
    this.selectedThirdClassId = environment.placeholderThirdClass;
    this.secondClassSelectDisable = false;

    this.dbService.getSecondClassList(firstClassId)
      .subscribe({
        next: (response) => {
          this.secondClassList = response
          this.updateNotificationSuccess("Datos actualizados correctamente")
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          this.updateNotificationError("Error al actualizar los datos")
        }
      });
  }

  onSecondClassChange(secondClassId: string) {
    this.selectedThirdClassId = environment.placeholderThirdClass;
    if (this.selectedSecondClassId == environment.placeholderSecondClass) {
      this.thirdClassSelectDisable = true;
    } else {
      this.thirdClassSelectDisable = false;
      this.dbService.getThirdClassList(this.selectedFirstClassId, secondClassId)
        .subscribe({
          next: (response) => {
            this.thirdClassList = response
            this.updateNotificationSuccess("Datos actualizados correctamente")
          },
          error: (error) => {
            console.error('Error fetching data:', error);
            this.updateNotificationError("Error al actualizar los datos")
          }
        });
    }

  }



  async getAllTheDataByYearAndFirstClassId() {
    Swal.fire({
      title: 'Cargando datos...',
      allowOutsideClick: false,
      showConfirmButton: true,
    })
    Swal.showLoading();
    this.dbService.getDataByYear(this.selectedYear, this.selectedFirstClassId)
      .subscribe({
        next: (response) => {
          console.log("😀");
          console.log(response);
          console.log("😀");
          this.countValuesInEdo = this.countValuesInEighthPosition(response);
          console.log("Counts of values in the 8th position (1 to 32):");
          console.log()
          for (let i = 1; i <= 32; i++) {
            console.log(`Value ${i}: ${this.countValuesInEdo[i]}`);
          }
          
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

  async updateTheDataForTheMap() {
    Swal.fire({
      title: 'Cargando datos...',
      allowOutsideClick: false,
      showConfirmButton: true,
    })
    
    await this.getAllTheDataByYearAndFirstClassId()
    Swal.fire({
            timer: 1100,
            title: 'Datos cargados correctamente.',
            icon: 'success'
          })
  }
  // do() {
  //   let allthedata;
  //   let showingData;
  //   if(verifyifselectedTheSecondClass()){
  //     showingData = filterBySecondClass(allthedata)
  //     if(verifyifselectedTheThirdClass()){
  //       showingData = filsterByThirdClass(showingData)
  //     }
  //   }
  //   showingData = applyFilters(showingData)
  //   statesMun //todos los municipios
  //   let listNew = {}

  //   this.statesMun.map((item) => {
  //     let hola = showingData.map((item2) => item2[4] == item[2]).length
  //     listNew[item[2]] = hola
  //   })
  //   console.log(listNew)
  // }

  // applyFilters(showingData){
  //   let filteredList = showingData;
  //   if(verifyGender()){
  //     filteredList = filterBy(5, 1,filteredList)//position in the list, value, list
  //   }
  //   if(verifyAge){
  //     filteredList = filterBy(5, 1,filteredList)
  //   }
  // }

  countingLists(list: []) {
    return list.length
  }

  filterBySecondClass(allTheData: []) {

  }
  filsterByThirdClass() {

  }
  filterByYearGenderAge() {

  }
  getStateList() {

  }
  getMunicipalityList() {

  }

  clearSubgroupSelection(event: any) {
    console.log(event)
  }

  countValuesInEighthPosition(data: any[]): Record<number, number> {
    const counts: Record<number, number> = {};
    for (let i = 1; i <= 32; i++) {
      counts[i] = 0;
    }
    console.log(counts)

    data.map(row => {
      const value = Number(row[3]);
      if (value >= 1 && value <= 32) {
        counts[value]++;
      }
    });

    return counts;
  }

  getDescriptionByIdInAList(id: string, dataList: [string, string][]): string | null {
    const item = dataList.find((listId) => listId[0] == id);
    return item ? item[1] : null;
  }

  updateResolution() {
    //this.resolution = "nunicipal"
    this.selectedRegion
    this.updatedResolution = this.selectedResolution
  }

  updateNotificationSuccess(title: string) {
    this.notification.fire({
      icon: "success",
      title: title
    });
  }

  updateNotificationError(title: string) {
    this.notification.fire({
      icon: "error",
      title: title
    });
  }
}