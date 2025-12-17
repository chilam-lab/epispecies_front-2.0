import { TreeSelectModule } from 'primeng/treeselect';
import { TreeModule } from 'primeng/tree';
import { CardModule } from 'primeng/card';
import { Component, ViewChild, ElementRef, OnInit, HostListener } from '@angular/core';
import { MapComponent } from '../../components/map/map.component';
import { DiseaseDbService } from '../../services/disease-db.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { environment, ageMap, nameCategories, categoriesFilterList } from '../../../environments/environment'
import { firstValueFrom } from 'rxjs';
import { Record } from '../../models/cve_list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'; // If you use matInput
import { MatSelectModule } from '@angular/material/select'; // If you use mat-select
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TreeNode } from 'primeng/api';

@Component({
  selector: 'app-main',
  imports: [MapComponent, CommonModule, FormsModule, MatIconModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatButtonModule,
  ReactiveFormsModule,
  FormsModule,
  TreeSelectModule,
  TreeModule,
  CardModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
  standalone: true,

})

export class MainComponent implements OnInit {

  constructor(private dbService: DiseaseDbService) { }
  @ViewChild('modalState') modalStateRef!: ElementRef;
  @ViewChild('modalMun') modalMunRef!: ElementRef;
  @ViewChild('closeMetroModal') metroCloseRef!: ElementRef;
  @ViewChild('closePeriodModal') periodCloseRef!: ElementRef;
  @ViewChild('showStateModal') showModalState!: ElementRef;
  @ViewChild('showMunModal') showModalMun!: ElementRef;
  @ViewChild('showMetroModal') showModalMetro!: ElementRef;
  @ViewChild(MapComponent) mapComponent!: MapComponent;
  env = environment;
  nameCat: { [key: string]: string } = nameCategories;
  selectedFirstClassId: string = environment.placeholderFirstClass;
  selectedSecondClassId: string = environment.placeholderSecondClass;
  selectedThirdClassId: string = environment.placeholderThirdClass;
  selectedAge: any = environment.placeholderAge;
  selectedAgeHelper: string = environment.placeholderAge;
  selectedGender: string = environment.placeholderGender;
  selectedYear: string = environment.placeholderYear;
  selectedRegion: string = environment.placeholderCountry;
  selectedResolution: string = environment.placeholderStateResolution;
  selectedMetropoly: string = environment.selectedMetropoli;
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
  genderTotals = {women: [], man: [], unspecified: []}
  metropolyList: [string, string][] = [];
  metropolyMunList: [string, string, string][] = [];
  showAgeTotals: [string,number][]= []
  showGenderTotals:[string,number][]= []
  selectedSeason: string = '';
  selectedMonth: number = 0;
  totalCases: number = 0;
  categoryList = [];
  categoriesId:any[] = [];
  selectedCategory = environment.placeholderCategory;
  currentSortColumn: string = '';
  currentSortOrder: 'asc' | 'desc' = 'asc';
  calculatedVariables = [];
  totalPopulationWithFilters: number = 0;
  seeExtraColumnsInCategory = false;
  selectedNodes: any = null; // Will hold selected node keys (e.g., { '0-0': true })

  climateNodes: TreeNode[] = [
    {
      label: 'Mean Diurnal Range (Mean of monthly (max temp - min temp))',
      key: 'diurnal',
      children: [] // Add leaves if needed
    },
    {
      label: 'Isothermality (BIO2/BIO7) (x100)',
      key: 'isothermality',
      children: []
    },
    {
      label: 'Annual Mean Temperature',
      key: 'annual',
      children: [
        { label: '2.050-13.525 1', key: 'annual-1', leaf: true },
        { label: '13.525-15.225 2', key: 'annual-2', leaf: true },
        { label: '15.225-16.146 3', key: 'annual-3', leaf: true },
        { label: '16.146-16.737 4', key: 'annual-4', leaf: true },
        { label: '16.737-17.225 5', key: 'annual-5', leaf: true },
        { label: '17.225-17.846 6', key: 'annual-6', leaf: true },
        { label: '17.846-18.517 7', key: 'annual-7', leaf: true },
        { label: '18.517-19.183 8', key: 'annual-8', leaf: true },
        { label: '19.183-19.867 9', key: 'annual-9', leaf: true }
      ]
    }
  ];

  monthsList = [
    { value: 1, name: 'Enero' },
    { value: 2, name: 'Febrero' },
    { value: 3, name: 'Marzo' },
    { value: 4, name: 'Abril' },
    { value: 5, name: 'Mayo' },
    { value: 6, name: 'Junio' },
    { value: 7, name: 'Julio' },
    { value: 8, name: 'Agosto' },
    { value: 9, name: 'Septiembre' },
    { value: 10, name: 'Octubre' },
    { value: 11, name: 'Noviembre' },
    { value: 12, name: 'Diciembre' }
  ];
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
          const lastyear = response[2][response[2].length - 1];
          this.yearsList = response[2].reverse();
          this.selectedYear = lastyear;
          console.log("AGE: 🎏")
          console.log(this.agesList)
        },
        error: (error) => {
          console.error('Error fetching age, gender and year data:', error);
        }
      });
    this.dbService.getAllFrom(environment.statesMunDictionaryTable)
      .subscribe({
        next: (response) => {
          this.statesAndMunList = response;
          this.stateNames = this.statesAndMunList.reduce((acc, state) => {
            acc[state[0]] = state[1];
            return acc;
          }, {} as { [key: number]: string });
          this.municipalityNames = this.statesAndMunList.reduce((acc, item) => {
            acc[item[2]] = item[3]; // Map code (position 2) to name (position 3)
            return acc;
          }, {} as { [key: string]: string });
          this.statesNameList = Object.values(this.stateNames).sort()
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
      this.dbService.getAllFrom(environment.municipalityTable)
      .subscribe({
        next: (response) => {
          this.metropolyMunList = response;
          const municipalityMap = new Map<string, string>();

          (response as string[][]).forEach((item: string[]) => {
            municipalityMap.set(item[2], item[1]); // name as key, id as value
          });

          const uniqueMetropoly: [string, string][] = Array.from(municipalityMap.entries())
            .map(([name, id]) => [id, name] as [string, string])
            .sort((a, b) => a[1].localeCompare(b[1]));
          this.metropolyList = uniqueMetropoly
          Swal.fire({
            timer: 1100,
            title: 'Datos cargados correctamente.',
            icon: 'success'
          })
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      })
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
  logSelected() {
        console.log('Selected node keys:', this.selectedNodes);
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
      this.allDataByFirstClass = response;
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
      if (this.selectedYear != this.hasChanges.selectedYear ||
          this.selectedFirstClassId != this.hasChanges.selectedFirstClassId) {
        await this.getAllTheDataByYearAndFirstClassId();
      }
      this.filteredAllDataByClasses = this.allDataByFirstClass;
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

    this.totalCases = this.filteredAllDataByClasses.length;

    let idSelectedState = Object.keys(this.stateNames).find(key => this.stateNames[+key] === this.selectedState) || 0;
    let munListByState = this.statesAndMunList.filter(x=> x[0]==idSelectedState)
    let idSelectedMun = munListByState.find(item => item[3] === this.selectedMuncipality)?.[2] || "";

    idSelectedMun = (idSelectedMun.length > 0) ? Number(idSelectedMun) > 10000 ? idSelectedMun : "0" + idSelectedMun : "";
    const idState = this.statesAndMunList.find(item => item[1] === this.selectedState);

    let stateMunList:any[];
    if(this.selectedRegion == environment.placeholderMetropoli){
      this.dataByMunToDisplayInMap = this.filterByMetropoli(municipalityDataList);
    } else if(idState){
      stateMunList = this.filterBy(0,idState[0],municipalityDataList)
      this.dataByMunToDisplayInMap = stateMunList;
    } else {
      this.dataByMunToDisplayInMap = municipalityDataList;
    }
    this.top10()
    this.totals()
    this.getCategories(this.selectedYear.toString(), this.selectedMetropoly, this.selectedState)
    this.updatedResolution = this.selectedResolution;
    this.updatedRegion = this.selectedRegion;
    this.selectedCVEState = Number(idSelectedState);
    this.getPopulationWithAllFilters()
    this.selectedCVEMun = idSelectedMun;
    this.saveNewSelectsValues();
    Swal.fire({
      timer: 1100,
      title: 'Datos cargados correctamente.',
      icon: 'success'
    })
  }

  getCategories(year:string, metropoli: string, state: string){
    this.selectedCategory = environment.placeholderCategory;
    this.categoryList = [];
    console.log("about to use categories")
    let verifiedMetropoli = "";
    let cve_state = 0;

    (this.selectedRegion == environment.placeholderMetropoli) ?
      verifiedMetropoli = metropoli :
      verifiedMetropoli = "";
    (this.selectedState != "") ?
        cve_state = Number(this.getStateCode(state)) ?? 0 :
        cve_state = 0;
    this.dbService.getCategoriesBy(year, verifiedMetropoli, cve_state)
      .subscribe({
        next: (response) => {
          console.log(response)
          this.categoryList = response;
          type NameCategoryKey = keyof typeof nameCategories;

          // 2. Get the keys at runtime
           const keys: NameCategoryKey[] = Object.keys(nameCategories) as NameCategoryKey[];
           this.categoriesId = keys;
          // // Example Usage:
           for (const key of keys) {
             console.log(`Key: ${key}, Value: ${nameCategories[key]}`);
              let h = response.filter((category:String) => {
                console.log("🍪")
                console.log(category)
               let a = category[0].split("_")

               return a[0] == key
             })
             categoriesFilterList[key] = h
            }
             console.log(categoriesFilterList)
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
    });
  }

  applyFilters(dataList: any[]) {
    let filteredList = dataList;
    console.log("Applying filter...")
    if (this.selectedAge != environment.placeholderAge) {
      filteredList = this.filterBy(8, this.selectedAge, filteredList)//position in the list, value, list
    }
    if (this.selectedGender != environment.placeholderGender) {
      filteredList = this.filterBy(7, this.selectedGender, filteredList)
    }
    let cve_state = this.getStateCode(this.selectedState)?.toString() ?? '';
    switch(this.selectedRegion){
      case environment.placeholderState: {
        filteredList = this.filterBy(3, cve_state, filteredList);
        break;
      }
      case environment.placeholderMunicipal: {
        filteredList = this.filterBy(3, cve_state, filteredList);
        break;
      }
      case environment.placeholderMetropoli:
        if(this.selectedMetropoly == environment.selectedMetropoli){
          filteredList = filteredList.filter((array) => array[5] !== null && array[5] !== '');
        } else {
          filteredList = this.filterBy(5, this.selectedMetropoly, filteredList);
        }
        break;
    default:
      break;
    }
    return filteredList;
  }

  filterByMetropoli(list: any[]){
    if(this.selectedMetropoly != environment.selectedMetropoli){
      let filteredMetropoly = this.metropolyMunList.filter(b => b[1] == this.selectedMetropoly);
      let metropolyIds = filteredMetropoly.map(item => item[0]);
      return list.filter((a: any[]) => metropolyIds.includes(a[1]));
    } else {
      let metropolyIds = this.metropolyMunList.map(item => item[0]);
      return list.filter((a: any[]) => metropolyIds.includes(a[1]));
    }
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

  async top10() {
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

    const top10StatesData = sorted.slice(0, 10);
    this.top10States = await Promise.all(
      top10StatesData.map(async (item) => {
        const populationState = await this.getPopulationById(item[0].toString(), "Stat");
        const rateState = populationState ? (item[1] / populationState) * 100000 : 0;
        return [...item, rateState];
      })
    );

    const top10MunData = dataToDisplay
      .sort((a, b) => b[2] - a[2])
      .slice(0, 10);

    this.top10Municipalities = await Promise.all(
      top10MunData.map(async (row) => {
        const populationMun = await this.getPopulationById(row[1].toString(), "Mun");
        const rateMun = populationMun ? (row[2] / populationMun) * 100000 : 0;
        return [...row, rateMun];
      })
    );
  }
  saveSelectedage(age: string){
    this.selectedAge = (age == 'Sin especificar') ? null : age;
  }

  async getPopulationById(id: string, resolution: string): Promise<number | null>{
    console.log(`id: ${id} resolution: ${resolution}`)
    let cvegeo = "";
    let cve_state = "";
    if(resolution === 'Mun') cvegeo = id ;
    if(resolution ==="Stat") cve_state = id;

    let verifyGender = (this.selectedGender == "1" || this.selectedGender == "2" ) ? this.selectedGender : "";
    let metropoli = "";
    if(this.selectedRegion == environment.placeholderMetropoli){
      metropoli = (this.selectedMetropoly == environment.selectedMetropoli) ? "all" : this.selectedMetropoly;
    }

    let age = (this.selectedAge != environment.placeholderAge) ? this.selectedAge : ""
    let result = await this.getPopulationData(this.selectedYear.toString(), cve_state, metropoli, age, verifyGender, cvegeo)
    return result
  }
  async getPopulationWithAllFilters(){
    let year = this.selectedYear;
    let gender = this.selectedGender;

    let age = "";
    let cve_state = "";
    let metropoli = "";
    let cvegeo = "";

    if(this.selectedAge != environment.placeholderAge){
      age = this.selectedAge;
    }
    let verifyGender = (gender == "1" || gender == "2" ) ? gender : "";

    if(this.selectedRegion === environment.placeholderCountry){}
    if(this.selectedRegion === environment.placeholderState){
      cve_state = this.selectedCVEState.toString()}
    if(this.selectedRegion === environment.placeholderMetropoli){
      metropoli = this.selectedMetropoly}

    this.totalPopulationWithFilters = await this.getPopulationData(year, cve_state, metropoli, age, verifyGender, cvegeo) | 0;
  }

  async getPopulationData(year: string, cve_state: string="", metropoli: string="",
                  age: string="", gender: string="", cvegeo: string= ""): Promise<number> {

    try {
      const response = await firstValueFrom(
        this.dbService.getPopulationBy(
          year,
          cve_state || '',
          metropoli || '',
          age || '',
          gender || '',
          cvegeo || ''
        )
      );
      return response;

    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire({
        timer: 1000,
        title: 'Ocurrio un error al cargar los datos.',
        icon: 'error'
      });
      return 0;
    }
  }

  saveNewSelectsValues() {
    this.hasChanges.selectedFirstClassId = this.selectedFirstClassId;
    this.hasChanges.selectedSecondClassId = this.selectedSecondClassId;
    this.hasChanges.selectedThirdClassId = this.selectedThirdClassId;
    this.hasChanges.selectedAge = this.selectedAge;
    this.hasChanges.selectedGender = this.selectedGender;
    this.hasChanges.selectedYear = this.selectedYear[0];
    this.hasChanges.selectedRegion = this.selectedRegion;
    this.hasChanges.selectedResolution = this.selectedResolution;
  }

  checkChangesInSelects() {
    this.hasChanges.selectedFirstClassId = this.selectedFirstClassId;
    this.hasChanges.selectedSecondClassId = this.selectedSecondClassId;
    this.hasChanges.selectedThirdClassId = this.selectedThirdClassId;
    this.hasChanges.selectedAge = this.selectedAge;
    this.hasChanges.selectedGender = this.selectedGender;
    this.hasChanges.selectedYear = this.selectedYear[0];
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

  getStateCode(stateName: string): number | undefined {
    const entry = Object.entries(this.stateNames).find(
      ([code, name]) => name === stateName
    );
    return entry ? Number(entry[0]) : undefined;
  }

  getMunicipalityCode(municipalityName: string): string | undefined {
    const entry = Object.entries(this.municipalityNames).find(
      ([code, name]) => name === municipalityName
    );
    return entry ? entry[0] : undefined;
  }

  onStateModalInputChange(e: Event) {
    this.selectedMuncipality = "";
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

  closingModal() {
    this.selectedState = "";
    this.selectedMuncipality = "";
    this.selectedMetropoly = environment.selectedMetropoli;
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
      this.modalMunRef.nativeElement.click();
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

  verifyDataInMetroModal() {
    this.selectedState = "";
    this.selectedMuncipality = "";
    this.metroCloseRef.nativeElement.click();
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
  showingMetropoliModal() {
    this.selectedMetropoly = environment.selectedMetropoli;
    this.showModalMetro.nativeElement.click();
    if (this.selectedRegion != this.env.placeholderMetropoli) {
      this.selectedResolution = this.env.placeholderMunResolution;
    } else {
      this.selectedResolution = this.env.placeholderMunResolution;
    }
  }

  updateMetropoly(metropoly: any){
    if(metropoly.target?.value){
      this.selectedMetropoly = metropoly.target.value;
    }
  }

  totals(){
    this.showAgeTotals = [];
    this.showGenderTotals = [];
    let cve_state = this.getStateCode(this.selectedState)?.toString() ?? '';
    let data = this.filteredAllDataByClasses;
    if(this.selectedRegion == environment.placeholderMunicipal){
        let munListByState = this.statesAndMunList.filter(x=> x[0]==cve_state)
        let cve_geo = munListByState.find(item => item[3] === this.selectedMuncipality)?.[2] || "";
        data = this.filterBy(4, cve_geo, data);
    }
    const genderMap = {
      "1": environment.placeholderMan,
      "2": environment.placeholderWoman,
      "9": environment.placeholderNoGender
    };
    const selectedGenders = this.selectedGender === environment.placeholderGender
      ? Object.keys(genderMap)
      : [this.selectedGender];

    this.showGenderTotals = selectedGenders
      .filter(id => genderMap[id as keyof typeof genderMap])
      .map(id => [genderMap[id as keyof typeof genderMap], this.filterBy(7, id, data).length]);

    const selectedAge = this.selectedAge === environment.placeholderAge
      ? Object.keys(ageMap)
      : (this.selectedAge ? [this.selectedAge]: ["null"]);

    this.showAgeTotals = selectedAge
      .filter(id => ageMap[id as keyof typeof ageMap])
      .map(id => {
        const label = ageMap[id as keyof typeof ageMap];
        const count = label === 'Sin especificar'
          ? data.filter(item => item[8] == null).length
          : this.filterBy(8, id, data).length;
          return [label, count];
        });
  }
  closingPeriodModal(){
    this.periodCloseRef.nativeElement.click();
  }

  verifyPeriodSelectedcModal(){
    this.periodCloseRef.nativeElement.click();
  }

  selectedPeriod(season: string){
  }

  sortTableBy(attribute: string) {
    if (this.currentSortColumn === attribute) {
      this.currentSortOrder = this.currentSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortColumn = attribute;
      this.currentSortOrder = 'asc';
    }

    this.calculatedVariables.sort((a, b) => {
      const valueA = a[attribute];
      const valueB = b[attribute];
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.currentSortOrder === 'desc' ? valueA - valueB : valueB - valueA;
      } else {
        const comparison = String(valueA).localeCompare(String(valueB));
        return this.currentSortOrder === 'asc' ? comparison : -comparison;
      }
    });
  }


  selectACategory(){
    if(this.selectedCategory != environment.placeholderCategory){
      let metropoli = "";
      let cve_state = "";
      (this.selectedRegion == environment.placeholderMetropoli) ?
        metropoli = this.selectedMetropoly :
        metropoli = "";
      (this.selectedState != "") ?
        cve_state = this.getStateCode(this.selectedState)?.toString() ?? '' :
        cve_state = '';

      this.dbService.getCalcVariablesBy(
        this.selectedCategory,
        this.selectedYear?.toString() || '',
        this.selectedFirstClassId || '',
        this.selectedSecondClassId || '',
        this.selectedThirdClassId || '',
        metropoli || '',
        cve_state || '',
        this.selectedAge || '',
        this.selectedGender || ''
      )
      .subscribe({
        next: (response) => {
          console.log(response)
          this.calculatedVariables = response;
          this.sortTableBy('category')
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
    } else {
      Swal.fire({
        timer: 1100,
        title: 'Por favor seleccione un modelo antes',
        icon: 'error'
      })
      return;

    }
  }

  downloadCSV() {
    const headers = ['Categoría', 'ncx', 'nx', 'n', 'nc', 'epsilon', 'score', 'log_lift', 'RR', 'SE_loglist', 'ICinf', 'ICsup'];
    const keys = ['category', 'ncx', 'nx', 'n', 'nc', 'epsilon', 'score', 'log_lift', 'RR', 'SE_loglist', 'ICinf', 'ICsup'];

    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // If value contains comma, quote, or newline, wrap in quotes and escape quotes
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csvRows = [
      headers.join(','), // Header row
      ...this.calculatedVariables.map(variable =>
        keys.map(key => escapeCSV(variable[key])).join(',')
      )
    ];

    const csvContent = csvRows.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = `calculated_variables_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  toggleExtraColumns() {
    this.seeExtraColumnsInCategory = !this.seeExtraColumnsInCategory;
  }
  onSelectionChange(event: { node: TreeNode }) {
    console.log('Selection changed:', this.selectedNodes);
    console.log('Affected node:', event.node);
    const node = event.node;

    // Check if this specific node is now FULLY selected
    if (this.selectedNodes.includes(node) && !node.partialSelected) {
      console.log('Whole node fully selected:', node);
      // Your logic here (e.g., treat as "all descendants selected")
    }

    // Optional: Check for partial
    if (node.partialSelected) {
      console.log('Node partially selected:', node);
    }

    // Full current selection is always in this.selectedNodes
    console.log('All selected nodes:', this.selectedNodes);
  }
}
