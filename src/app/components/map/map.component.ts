import { Component, OnInit, SimpleChanges, Input } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from './mapService';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DiseaseDbService } from '../../services/disease-db.service';
import { getMatInputUnsupportedTypeError } from '@angular/material/input';

@Component({
  selector: 'app-map',
  imports: [],
  standalone: true,
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit {
  private map: L.Map | undefined;
  @Input() updatedResolution: string = "";
  @Input() updatedRegion: string = "";
  @Input() dataByMunToDisplayInMap: [number, string, string][] = [];
  @Input() selectedCVEState: number = 0;
  @Input() selectedCVEMun: string = "";
  @Input() statesAndMunList: any = [];
  @Input() selectedYear: string = "";
  @Input() selectedMetropoly: string = "";
  @Input() stateNames!: { [key: number]: string };
  @Input() municipalityNames!: { [key: string]: string };
  @Input() totalCases: number = 0;
  constructor(private mapService: MapService, private diseaseDB: DiseaseDbService) { }
  geoJsonLayerMunicipal: any;
  geoJsonLayerStates: any;
  currentLegend: L.Control | undefined;
  casesGeoJsonLayer: L.GeoJSON | undefined;
  rateGeoJsonLayer: L.GeoJSON | undefined;
  selectedResolution: string = environment.placeholderStateResolution;
  selectedRegion: string = environment.placeholderCountry;
  rawDataTodisplayByMun: [number, string, string][] = [];
  highestValueInData = 0;
  highestRateInData = 0;
  populationByYearList: [number, string, number][] = [];
  coloringMode: 'cases' | 'rate' = 'rate';
  currentLayerGroup: L.FeatureGroup | undefined;
  private layerControl: L.Control.Layers | undefined;
  currentTotalPopulation = 0;

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  private initializeMap(): void { }

  async ngOnInit() {
    const statesGeoJson = await firstValueFrom(this.mapService.getStates(17));
    const municiapalGeoJson = await firstValueFrom(this.mapService.getStates(18));
    this.geoJsonLayerStates = statesGeoJson.json;
    this.geoJsonLayerMunicipal = municiapalGeoJson.json;
    this.map = L.map('map').setView([11.87, -81.58], 5);

    this.map.touchZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.boxZoom.disable();
    this.map.keyboard.disable();
    this.map.scrollWheelZoom.disable();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.updateMapLayerView("states");

  }

  updateMapLayerView(isStateOrMunicipality: string) {
    if (!this.map) return;

    let geoJson;
    (isStateOrMunicipality === 'Municipal') ?
      geoJson = this.geoJsonLayerMunicipal :
      geoJson = this.geoJsonLayerStates;

    if (isStateOrMunicipality === 'Municipal') {
      // Single municipality
      if (this.selectedCVEMun.length > 0) {
        const filteredFeatures = geoJson.features.filter(
          (feature: { properties: { cellid: number; clave: string; }; }) =>
          feature.properties.clave === this.selectedCVEMun.toString());
        geoJson = { type: "FeatureCollection", features: filteredFeatures};
      } else if (this.selectedCVEState != 0) {
        // Municipalities of the state
          let list = this.statesAndMunList.filter((item: any[]) => item[0] === this.selectedCVEState);
          let municipalityCodes = list.map((item: any[]) => Number(item[2]) > 10000 ? item[2] : "0" + item[2]);
          let filteredFeatures = geoJson.features.filter(
            (feature: { properties: { cellid: number; clave: string; }; }) =>
            municipalityCodes.includes(feature.properties.clave));
          geoJson = { type: "FeatureCollection", features: filteredFeatures };
      } else {
        //Metropoli
        const municipalityCodes= this.dataByMunToDisplayInMap.map(([, code]) => {
          return Number(code) > 10000 ? code : '0' + code });
          let filteredFeatures = geoJson.features.filter(
            (feature: { properties: { cellid: number; clave: string; }; }) =>
            municipalityCodes.includes(feature.properties.clave));
          geoJson = { type: "FeatureCollection", features: filteredFeatures };
      }
    } else {
      //States
      if (this.selectedCVEState > 0) {
        const filteredFeatures = geoJson.features.filter(
          (feature: { properties: { cellid: number; clave: string; }; }) =>
          feature.properties.cellid === this.selectedCVEState
        );
        geoJson = { type: "FeatureCollection", features: filteredFeatures};
      }
    }

    if (this.currentLegend) {
      this.map.removeControl(this.currentLegend);
      this.currentLegend = undefined;
    }

    if (this.layerControl) {
      this.map.removeControl(this.layerControl);
    }
    if (this.casesGeoJsonLayer) {
      this.map.removeLayer(this.casesGeoJsonLayer);
      this.casesGeoJsonLayer = undefined;
    }
    if (this.rateGeoJsonLayer) {
      this.map.removeLayer(this.rateGeoJsonLayer);
      this.rateGeoJsonLayer = undefined;
    }

    // Create the cases layer
    this.casesGeoJsonLayer = L.geoJSON(geoJson, {
      style: (feature: any | undefined) => {
        if (feature?.properties) {
          const fillColor = this.getColorForValue(this.numCasesByIdRegion(feature.properties.clave)) || 'transparent';
          return {
            fillColor,
            weight: 0.5,
            opacity: 1,
            color: '#000000',
            fillOpacity: 0.8,
          };
        }
        return {
          fillColor: 'transparent',
          weight: 0,
          opacity: 0,
          color: 'transparent',
          fillOpacity: 0,
        };
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          const cases = this.numCasesByIdRegion(feature.properties.clave);
          const pop = this.getPopulationById(feature.properties.clave);
          const rate = pop ? (cases / pop) * 100000 : 0;
          const risk = pop ? (cases / this.currentTotalPopulation) * 100000 : 0;
          const placeholder = isStateOrMunicipality == 'Municipal' ? "Municipio" : "Estado"
          const name = isStateOrMunicipality == 'Municipal' ? this.getMunicipalityName(feature.properties.clave): this.getStateName(Number(feature.properties.clave))
          layer.bindPopup(
            `<table class="table">
               <tbody>
                 <tr>
                   <th>${placeholder}</th>
                   <th>${name}</th>
                 </tr>
                 <tr>
                   <th>No. Casos</th>
                   <td>${cases}</td>
                 </tr>
                 <tr>
                   <th>No. Casos en el ${this.selectedRegion}</th>
                   <td>${this.totalCases}</td>
                 </tr>
                 <tr>
                   <th>Población</th>
                   <td>${pop?.toLocaleString('en-US')}</td>
                 </tr>
                 <tr>
                   <th>Población en el ${this.selectedRegion}</th>
                   <td>${this.currentTotalPopulation?.toLocaleString('en-US')}</td>
                 </tr>
                 <tr>
                   <th>Tasa</th>
                   <td>${rate.toFixed(4)}</td>
                 </tr>
                 <tr>
                   <th>Razón de tasas</th>
                   <td>${risk.toFixed(4)}</td>
                 </tr>
               </tbody>
             </table>`
          );
          layer.bindTooltip(`Clave: ${feature.properties.clave} cases: ${this.numCasesByIdRegion(feature.properties.clave)}`, { sticky: true });
        }
      }
    });

    // Create the rate layer
    this.rateGeoJsonLayer = L.geoJSON(geoJson, {
      style: (feature: any | undefined) => {
        if (feature?.properties) {
          const rate = this.getRateForRegion(feature.properties.clave);
          const fillColor = this.getColorForValue(rate, true) || '#ffffff'; // true = rate mode
          return {
            fillColor,
            weight: 0.5,
            opacity: 1,
            color: '#000000',
            fillOpacity: 0.7,
          };
        }
        return {
          fillColor: '#ffffff',
          weight: 0.5,
          opacity: 1,
          color: '#000000',
          fillOpacity: 0.8,
        };
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          const cases = this.numCasesByIdRegion(feature.properties.clave);
          const pop = this.getPopulationById(feature.properties.clave);
          const rate = pop ? (cases / pop) * 100000 : 0;
          const risk = pop ? (rate / (Number(this.totalCases) / Number(this.currentTotalPopulation) * 100000)) : 0;
          const placeholder = isStateOrMunicipality == 'Municipal' ? "Municipio" : "Estado"
          const name = isStateOrMunicipality == 'Municipal' ? this.getMunicipalityName(Number(feature.properties.clave)): this.getStateName(Number(feature.properties.clave))
          layer.bindPopup(
            `<table class="table">
               <tbody>
                 <tr>
                   <th>${placeholder}</th>
                   <th>${name}</th>
                 </tr>
                 <tr>
                   <th>No. Casos</th>
                   <td>${cases}</td>
                 </tr>
                 <tr>
                   <th>No. Casos en el ${this.selectedRegion}</th>
                   <td>${this.totalCases}</td>
                 </tr>

                 <tr>
                   <th>Población</th>
                   <td>${pop?.toLocaleString('en-US')}</td>
                 </tr>
                 <tr>
                   <th>Población en el ${this.selectedRegion}</th>
                   <td>${this.currentTotalPopulation?.toLocaleString('en-US')}</td>
                 </tr>
                 <tr>
                   <th>Tasa</th>
                   <td>${rate.toFixed(4)}</td>
                 </tr>
                 <tr>
                   <th>Razón de tasas</th>
                   <td>${risk.toFixed(4)}</td>
                 </tr>
               </tbody>
             </table>`
          );
          layer.bindTooltip(`Clave: ${feature.properties.clave} tasa: ${rate.toFixed(2)}`, { sticky: true });
        }
      }
    }).addTo(this.map);

    const baseLayers = {
      "Número de casos": this.casesGeoJsonLayer,
      "Tasa por 100,000": this.rateGeoJsonLayer
    };

    // Add layer control
    this.layerControl = L.control.layers(baseLayers, {}, { collapsed: false }).addTo(this.map);
    this.coloringMode = 'rate';

    // Handle layer changes
    this.map.on('baselayerchange', (e: any) => {
      this.coloringMode = e.name === "Número de casos" ? "cases" : "rate";
      if (this.currentLegend) {
        this.map!.removeControl(this.currentLegend);
        this.currentLegend = this.createLegend();
        this.currentLegend.addTo(this.map!);
      }
    });

    this.currentLegend = this.createLegend();
    this.currentLegend.addTo(this.map);

    const bounds = this.casesGeoJsonLayer.getBounds();
    if (bounds.isValid()) {
      this.map.fitBounds(bounds);
    } else {
      this.map.setView([11.87, -81.58], 5);
    }
  }

  numCasesByIdRegion(id: string): number {
    let hey = Number(id)
    let ajs = hey.toString();
    if (this.selectedResolution === 'Municipal') {
      let sum = Number(this.dataByMunToDisplayInMap.filter(item => item[1] === ajs)[0][2])
      return sum;
    } else {
      const sum = this.dataByMunToDisplayInMap
      .filter(item => item[0] === Number(id))
      .reduce((sum, item) => sum + Number(item[2]), 0);
      return sum;
    }
  }

  getStateName(stateCode: number): string {
    return this.stateNames[stateCode] || environment.UnknownState;
  }

  getMunicipalityName(code: any): string {
    code = code.toString()
    return this.municipalityNames[code] || environment.unknownMunicipality;
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("🍥🍥🍥🍥🍥🍥🍥")
    console.log(changes)
    console.log("🍥🍥🍥🍥🍥🍥🍥")
    try {
      let newResolution = changes['updatedResolution']['currentValue'];
      if (newResolution && newResolution != this.selectedResolution)  this.selectedResolution = newResolution;
    } catch (err) { console.log("no resolution updates"); }

    try {
      let year = changes['selectedYear']['currentValue'];
      if (year && typeof year[0] === 'number') {
        let numberYear = Number(year[0]).toString();
        this.selectedYear = numberYear;
        this.getPopulationData();
      }
    } catch (err) { console.log("no year updates");}

    try {
      let dataToDisplayByMun = changes['dataByMunToDisplayInMap']['currentValue'];
      console.log("😵‍💫😵‍💫😵‍💫")
      console.log(dataToDisplayByMun)
      console.log("😵‍💫😵‍💫😵‍💫")
      if (dataToDisplayByMun.length != 0) {
        this.rawDataTodisplayByMun = dataToDisplayByMun;

        let maxValue = 0;
        let maxRate = 0;

        if (this.selectedResolution === "Municipal") {

          for (const row of this.rawDataTodisplayByMun) {
            const value = row[2];           // number of cases
            const id = row[1];              // the ID to get population
            const population = this.getPopulationById(id);

            if (typeof value === 'number' && value > maxValue) maxValue = value;

            if (population && population > 0) {
              const rate = (Number(value) / population) * 100000;
              if (rate > maxRate) maxRate = rate;
            }
          }
        } else {
          const stateSums = this.dataByMunToDisplayInMap.reduce((acc, row) => {
            const stateId = row[0];
            const cases = Number(row[2]);
            acc.set(stateId, (acc.get(stateId) || 0) + cases);
            return acc;
          }, new Map<number, number>());
          maxValue = Math.max(...stateSums.values());
          let maxRateStateId: number | null = null;

          for (const [stateId, cases] of stateSums.entries()) {
            const population = this.getPopulationById(stateId.toString());
            if (population && population > 0) { // avoid division by zero
              const rate = (cases / population) * 100000;
              if (rate > maxRate) {
                maxRate = rate;
                maxRateStateId = stateId;
              }
            }
          }
        }
        this.highestValueInData = maxValue;
        this.highestRateInData = maxRate;

      }
    } catch (err) {
      console.log("no updates in the data")
    }

    try {
      let newRegion = changes['updatedRegion']['currentValue'];
      if (newRegion && newRegion != this.selectedRegion) { this.selectedRegion = newRegion; }
    } catch (err) { console.log("no region updates");}
    this.calculateTotalPopulation();

    this.updateMapLayerView(this.selectedResolution);
  }


  getColorForValue(value: number, isRate: boolean = false): string {
    const maxValue = isRate ? this.highestRateInData : this.highestValueInData;

    if (maxValue === 0) return '#DDDDDD';
    if (value === 0) return '#DDDDDD';

    // Define small ranges (5 equal parts)
    if (maxValue <= 5) {
      const colors = ['#FFEDA0', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];
      const colorIndex = Math.min(Math.floor(value) - 1, colors.length - 1);
      return colors[Math.max(0, colorIndex)];
    }

    // Handle larger datasets with quintiles
    const q_1 = maxValue * (1.0 / 5.0);
    const q_2 = maxValue * (2.0 / 5.0);
    const q_3 = maxValue * (3.0 / 5.0);
    const q_4 = maxValue * (4.0 / 5.0);

    if (value > q_4) return '#800026';
    if (value > q_3) return '#BD0026';
    if (value > q_2) return '#E31A1C';
    if (value > q_1) return '#FC4E2A';
    return '#FFEDA0';
  }

  getRateForRegion(id: string): number {
    const cases = this.numCasesByIdRegion(id);
    const population = this.getPopulationById(id);
    return population && population > 0 ? (cases / population) * 100000 : 0;
  }

  getValueForRegion(id: string): number {
    const cases = this.numCasesByIdRegion(id);
    const pop = this.getPopulationById(id);
    return pop && pop > 0 ? (cases / pop) * 100000 : 0;
  }

  getPopulationById(id: string): number | null {
    if (this.selectedResolution === 'Municipal') {
      // For municipal level, find the population for the specific municipalId (item[1])
      const item = this.populationByYearList.find(subarray => Number(subarray[1]) == Number(id));
      return item ? item[2] : null;
    } else {
      const munListByState = this.dataByMunToDisplayInMap.filter(item => item[0] === Number(id));

      // Sum populations from populationByYearList where municipal IDs match
      const sum = munListByState.reduce((total, mun) => {
        const municipalId = mun[1]; // Municipal ID from dataByMunToDisplayInMap
        const popItem = this.populationByYearList.find(item => item[1] === municipalId);
        return total + (popItem ? Number(popItem[2]) : 0);
      }, 0);

      return sum > 0 ? sum : null;
    }
  }

  createLegend(): L.Control {
    const legend = new L.Control({ position: 'bottomleft' });

    legend.onAdd = (map) => {
      const div = L.DomUtil.create('div', 'info legend');

      const maxValue = this.coloringMode === 'rate' ? this.highestRateInData : this.highestValueInData;
      const title = this.coloringMode === 'rate' ? 'Tasa por 100,000 hab.' : 'Número de casos';

      if (!maxValue || maxValue === 0) {
        div.innerHTML = `<h5>${title}</h5><p>${environment.placeholderNoData}</p>`;
        return div;
      }

      let ranges: any[] = [];

      if (maxValue <= 5) {
        ranges.push({ color: '#DDDDDD', label: '0' });
        for (let i = 1; i <= maxValue; i++) {
          const colors = ['#FFEDA0', '#FD8D3C', '#FC4E2A', '#E31A1C', '#800026'];
          const colorIndex = Math.min(i - 1, colors.length - 1);
          ranges.push({
            color: colors[colorIndex],
            label: this.coloringMode === 'rate' ? i.toFixed(2) : i.toString()
          });
        }
      } else {
        const minimunNumber = this.coloringMode === 'rate' ? 0.01 : 1
        const q_1 = maxValue * (1.0 / 5.0);
        const q_2 = maxValue * (2.0 / 5.0);
        const q_3 = maxValue * (3.0 / 5.0);
        const q_4 = maxValue * (4.0 / 5.0);
        const q_5 = maxValue;

        const formatValue = (val: number) =>
        this.coloringMode === 'rate' ? val.toFixed(2) : Math.ceil(val).toString();

        ranges = [
          { color: '#DDDDDD', label: '0' },
          { color: '#FFEDA0', label: `${minimunNumber} - ${formatValue(q_1)}` },
          { color: '#FD8D3C', label: `${formatValue(q_1 + 0.01)} - ${formatValue(q_2)}` },
          { color: '#FC4E2A', label: `${formatValue(q_2 + 0.01)} - ${formatValue(q_3)}` },
          { color: '#E31A1C', label: `${formatValue(q_3 + 0.01)} - ${formatValue(q_4)}` },
          { color: '#800026', label: `${formatValue(q_4 + 0.01)} - ${formatValue(q_5)}` }
        ];
      }

      div.innerHTML = `<h5>${title}</h5>`;
      ranges.forEach(range => {
        div.innerHTML +=
          `<i style="background:${range.color}; width: 18px; height: 18px; display: inline-block; margin-right: 8px;"></i> ` +
          `${range.label}<br>`;
      });

      return div;
    };

    return legend;
  }
  getPopulationData(){
    let year = Number(this.selectedYear).toString()
    this.diseaseDB.getDataByYearInTable(year, environment.tablePopulationTotal)
    .subscribe({
      next: (response) => {
        this.populationByYearList = response;
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

  calculateTotalPopulation(){
    let total = 1;
    let population = this.populationByYearList;
    if(this.selectedRegion == environment.placeholderCountry){
      total = population.reduce((total: number, item: any[]) => {
          return item[0] === Number(this.selectedYear) ? total + item[2] : total;
        }, 0);
    } else {
      const municipalityCodes = new Set(this.rawDataTodisplayByMun.map(item => item[1]));
      total = population
      .filter(item => item[0] === Number(this.selectedYear) && municipalityCodes.has(item[1] as string))
      .reduce((sum, item) => sum + (item[2] as number), 0);
    }
    console.log(total)
    this.currentTotalPopulation = total;
  }
}
