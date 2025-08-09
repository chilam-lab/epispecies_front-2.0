import { Component, ViewChild, ElementRef, OnInit, HostListener } from '@angular/core';
import { MapComponent } from '../../components/map/map.component';
import { DiseaseDbService } from '../../services/disease-db.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { MatIconModule } from '@angular/material/icon';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { Record } from '../../models/cve_list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'; // If you use matInput
import { MatSelectModule } from '@angular/material/select'; // If you use mat-select
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-main',
  imports: [MapComponent, CommonModule, FormsModule, MatIconModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  ReactiveFormsModule,
  FormsModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
  standalone: true,

})

export class MainComponent implements OnInit {

  constructor(private dbService: DiseaseDbService) { }
  @ViewChild('modalState') modalStateRef!: ElementRef;
  @ViewChild('modalMun') modalMunRef!: ElementRef;
  @ViewChild('showStateModal') showModalState!: ElementRef;
  @ViewChild('showMunModal') showModalMun!: ElementRef;
  env = environment;
  selectedFirstClassId: string = environment.placeholderFirstClass;
  selectedSecondClassId: string = environment.placeholderSecondClass;
  selectedThirdClassId: string = environment.placeholderThirdClass;
  selectedAge: string = environment.placeholderAge;
  selectedGender: string = environment.placeholderGender;
  selectedYear: string = environment.placeholderYear;
  selectedRegion: string = environment.placeholderCountry;
  selectedResolution: string = environment.placeholderStateResolution;
  hasChanges = {
    selectedFirstClassId: "",
    selectedSecondClassId: "",
    selectedThirdClassId: "",
    selectedAge: "",
    selectedGender: "",
    selectedYear: "",
    selectedRegion: "",
    selectedResolution: "",
  }
  firstClassList: any[] = [];
  secondClassList: any[] = [];
  thirdClassList = [];
  secondClassSelectDisable = true;
  thirdClassSelectDisable = true;
  agesList = [];
  gendersList = [];
  yearsList = [];
  statesAndMunList = []
  statesNameList: any = []
  munNameList: any = []
  selectedState = "";
  selectedMuncipality = "";
  selectedCVEState: number = 0;
  selectedCVEMun: string = "";
  stateNames: { [key: number]: string } = {}
  municipalityNames: { [key: string]: string } = {};
  allDataByFirstClass: Record[] = [];
  filteredAllDataByClasses: any[] = [];
  displayData: any = [];
  dataByMunToDisplayInMap: any[] = [];
  updatedRegion: string = environment.placeholderCountry;
  updatedResolution: string = environment.placeholderStateResolution;
  top10States: number[][] = [];
  top10Municipalities: number[][] = [];
  gendersDict = { 1: "Hombres", 2: "Mujeres", 9: "No registrado" }
  notification = Swal.mixin({
    toast: true,
    position: "bottom-end",
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
    this.dbService.uniquePairColumns(environment.firstClassIdColumn, environment.firstClassDescripColumn, environment.modelsDictionaryTable)
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
    this.dbService.getUniqueValues([environment.ageGrupoColumn, environment.genderColumn, environment.yearColumn])
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
    this.dbService.getAllFrom(environment.statesMunDictionaryTable)
      .subscribe({
        next: (response) => {
          this.statesAndMunList = response;
          console.log(this.statesAndMunList)
          this.stateNames = this.statesAndMunList.reduce((acc, state) => {
            acc[state[0]] = state[1];
            return acc;
          }, {} as { [key: number]: string });
          this.municipalityNames = this.statesAndMunList.reduce((acc, item) => {
            acc[item[2]] = item[3]; // Map code (position 2) to name (position 3)
            return acc;
          }, {} as { [key: string]: string });
          this.statesNameList = Object.values(this.stateNames).sort()
          console.log("😱")
          console.log(this.stateNames)
          console.log(this.municipalityNames)
          console.log(this.statesNameList)
          console.log("😱")
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

  async getAllTheDataByYearAndFirstClassId(): Promise<Record[]> {
    try {
      const response = await firstValueFrom(
        this.dbService.getDataByYear(this.selectedYear, this.selectedFirstClassId)
      );
      console.log("😀");
      console.log(response);
      this.allDataByFirstClass = response;
      console.log("😀");
      return response;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  async updateTheDataForTheMap() {
    if (this.selectedFirstClassId == environment.placeholderFirstClass) {
      Swal.fire({
        timer: 1100,
        title: 'Por favor seleccione una enfermedad',
        icon: 'error'
      })
      return;
    }

    Swal.fire({
      title: 'Cargando datos...',
      allowOutsideClick: false,
      showConfirmButton: true,
    })
    Swal.showLoading();
    //add verification for the models
    try {
      if (this.selectedFirstClassId != this.hasChanges.selectedFirstClassId) {
        await this.getAllTheDataByYearAndFirstClassId();
        this.filteredAllDataByClasses = this.allDataByFirstClass;
      }
      let filterDataBySubClasses;
      if (this.selectedSecondClassId != environment.placeholderSecondClass) {
        filterDataBySubClasses = this.filterBy(1, this.selectedSecondClassId, this.allDataByFirstClass);
        this.filteredAllDataByClasses = filterDataBySubClasses;
        if (this.selectedThirdClassId != environment.placeholderThirdClass) {
          filterDataBySubClasses = this.filterBy(2, this.selectedThirdClassId, filterDataBySubClasses);
          this.filteredAllDataByClasses = filterDataBySubClasses;
        }
      }
      this.filteredAllDataByClasses = this.applyFilters(this.filteredAllDataByClasses)
    } catch (error) {
      console.error('Error updating map data:', error);
    }
    //count by municipalities
    let municipalityDataList: any[] = [];
    this.statesAndMunList.map((region) => {
      let casesNumber = this.filteredAllDataByClasses.filter((record) => record[4] == region[2]).length
      municipalityDataList.push([region[0], region[2], casesNumber])
    })

    let idSelectedState = Object.keys(this.stateNames).find(key => this.stateNames[+key] === this.selectedState) || 0;
    let idSelectedMun = this.statesAndMunList.find(item => item[3] === this.selectedMuncipality)?.[2] || "";
    idSelectedMun = (idSelectedMun.length > 0) ? Number(idSelectedMun) > 10000 ? idSelectedMun : "0" + idSelectedMun : "";
    const idState = this.statesAndMunList.find(item => item[1] === this.selectedState);
    console.log("ta 🧇")
    console.log(idState);
    this.dataByMunToDisplayInMap = municipalityDataList;
    this.top10()
    let a:any[];
    if(idState){
      console.log(idState)
      a = this.filterBy(0,idState[0],municipalityDataList)
      this.dataByMunToDisplayInMap = a;
      console.log(a)
    }
    console.log("the data 👀")
    console.log(this.dataByMunToDisplayInMap)
    console.log("the data 👀")
    this.updatedResolution = this.selectedResolution;
    this.selectedCVEState = Number(idSelectedState);
    this.selectedCVEMun = idSelectedMun;
    this.saveNewSelectsValues();
    Swal.fire({
      timer: 1100,
      title: 'Datos cargados correctamente.',
      icon: 'success'
    })
  }

  applyFilters(dataList: any[]) {
    let filteredList = dataList;
    console.log("🌈Before filters: ")
    console.log(filteredList)
    console.log(this.selectedAge)
    console.log(this.selectedGender)
    if (this.selectedAge != environment.placeholderAge) {
      filteredList = this.filterBy(8, this.selectedAge, filteredList)//position in the list, value, list
      console.log("🌈After filter one:")
      console.log(filteredList)
    }
    if (this.selectedGender != environment.placeholderGender) {
      filteredList = this.filterBy(7, this.selectedGender, filteredList)
      console.log("🌈After all filters:")
      console.log(filteredList)
    }
    return filteredList;
  }

  filterBy(position: number, value: string, dataList: any[]) {
    return dataList.filter((array) => array[position] == value);
  }

  getDescriptionByIdInAList(id: string, dataList: [string, string][]): string | null {
    const item = dataList.find((listId) => listId[0] == id);
    return item ? item[1] : null;
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

  top10() {
    let dataToDisplay = this.dataByMunToDisplayInMap;
    if( this.selectedRegion !== environment.placeholderMetropoli &&  this.selectedRegion !== environment.placeholderCountry &&
      this.selectedResolution == environment.placeholderMunResolution){
      if(this.selectedState === "") { this.updateNotificationError("No se pudieron cargar los datos para el top 10"); return;}
      const idState = this.statesAndMunList.find(item => item[1] === this.selectedState);
      if(idState){
        dataToDisplay = this.filterBy(0, idState[0], dataToDisplay)
      }
    }
    const groupedByStates = dataToDisplay.reduce((acc, [first, , third]) => {
      acc[first] = (acc[first] || 0) + third;
      return acc;
    }, {});

    const sorted = Object.entries(groupedByStates)
      .map(([key, sum]) => [parseInt(key), sum as number])
      .sort((a, b) => b[1] - a[1]);

    this.top10States = sorted.slice(0, 10);
    this.top10Municipalities = dataToDisplay
      .sort((a, b) => b[2] - a[2])
      .slice(0, 10);
  }

  saveNewSelectsValues() {
    this.hasChanges.selectedFirstClassId = this.selectedFirstClassId;
    this.hasChanges.selectedSecondClassId = this.selectedSecondClassId;
    this.hasChanges.selectedThirdClassId = this.selectedThirdClassId;
    this.hasChanges.selectedAge = this.selectedAge;
    this.hasChanges.selectedGender = this.selectedGender;
    this.hasChanges.selectedYear = this.selectedYear;
    this.hasChanges.selectedRegion = this.selectedRegion;
    this.hasChanges.selectedResolution = this.selectedResolution;
  }

  checkChangesInSelects() {
    this.hasChanges.selectedFirstClassId = this.selectedFirstClassId;
    this.hasChanges.selectedSecondClassId = this.selectedSecondClassId;
    this.hasChanges.selectedThirdClassId = this.selectedThirdClassId;
    this.hasChanges.selectedAge = this.selectedAge;
    this.hasChanges.selectedGender = this.selectedGender;
    this.hasChanges.selectedYear = this.selectedYear;
    this.hasChanges.selectedRegion = this.selectedRegion;
    this.hasChanges.selectedResolution = this.selectedResolution;

  }

  getStateName(stateCode: number): string {
    return this.stateNames[stateCode] || environment.UnknownState;
  }

  getMunicipalityName(code: any): string {
    code = code.toString()
    return this.municipalityNames[code] || environment.unknownMunicipality;
  }

  onStateModalInputChange(e: Event) {
    this.selectedMuncipality = "";
    console.log("🌸")
    console.log(this.selectedState)
    console.log("🌸")
    let isAState = this.isValueInsideList(this.statesNameList, this.selectedState)
    if (isAState) {
      this.updateNotificationSuccess("Datos actualizados correctamente")
      this.munNameList = this.filterBy(1, this.selectedState, this.statesAndMunList)
        .sort((a, b) => a[3].localeCompare(b[3]));
      this.modalStateRef.nativeElement.click();
    } else {
      this.updateNotificationError("Datos actualizados erroneamente")
      this.selectedState = "";
    }
  }

  isValueInsideList(list: string[], value: string) {
    return list.includes(value)
  }

  closingModal(mensaje: string) {
    this.selectedState = "";
    this.selectedMuncipality = "";
    this.selectedRegion = environment.placeholderCountry;
  }

  selectStateInModal() {
    this.selectedMuncipality = "";
    let isAState = this.isValueInsideList(this.statesNameList, this.selectedState)
    if (isAState) {
      Swal.fire({
        timer: 1100,
        title: 'Estado seleccionado correctamente.',
        icon: 'success'
      })
      this.modalStateRef.nativeElement.click();
    } else {
      this.selectedState = "";
      Swal.fire({
        timer: 1100,
        title: 'Por favor seleccione un estado valido',
        icon: 'error'
      })
    }
  }
  verifyDataInMunModal() {
    let isAState = this.isValueInsideList(this.statesNameList, this.selectedState)
    if (isAState) {
      Swal.fire({
        timer: 1100,
        title: 'Municipio seleccionado correctamente.',
        icon: 'success'
      })
      console.log("🤣")
      console.log(this.selectedMuncipality)
      this.modalMunRef.nativeElement.click();
      console.log(this.selectedMuncipality)
      console.log("🤣")
    } else {
      this.selectedState = "";
      this.selectedMuncipality = "";
      Swal.fire({
        timer: 1100,
        title: 'Por favor seleccione un estado valido',
        icon: 'error'
      })
    }
  }
  showingModalsFromSelect() {
    this.selectedState = "";
    this.selectedMuncipality = "";
    if (this.selectedRegion == environment.placeholderState) this.showModalState.nativeElement.click();
    if (this.selectedRegion == environment.placeholderMunicipal) this.showModalMun.nativeElement.click();
    if (this.selectedRegion != this.env.placeholderMunicipal) {
      this.selectedResolution = this.env.placeholderMunResolution;
    } else {
      this.selectedResolution = this.env.placeholderMunResolution;
    }
  }
  totals(){

  }
}
