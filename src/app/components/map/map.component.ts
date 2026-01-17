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
  @Input() totalPopulationWithFilters: number = 0;
  @Input() selectedAge: string = "";
  @Input() selectedGender: string = "";
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

  async updateMapLayerView(isStateOrMunicipality: string) {
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

    // ✨ PRE-CALCULATE ALL DATA ONCE
    const dataCache = new Map<string, {
      cases: number;
      population: number;
      rate: number;
      riskCases: number;
      riskRate: number;
      name: string;
    }>();

    const placeholder = isStateOrMunicipality == 'Municipal' ? "Municipio" : "Estado";

    const claves = geoJson.features
    .filter((f: any) => f.properties?.clave)
    .map((f: any) => Number(f.properties.clave).toString());

    let populationById = await this.getPop(claves);

    geoJson.features.forEach((feature: any) => {
      if (feature.properties?.clave) {
        const clave = feature.properties.clave.toString();
        const cases = this.numCasesByIdRegion(clave);
        const population = populationById[Number(clave).toString()] ?? 0;

        const rate = population ? (cases / population) * 100000 : 0;
        const riskCases = rate;
        const riskRate = cases && this.totalCases && this.totalPopulationWithFilters
          ? (rate / ((Number(this.totalCases) / Number(this.totalPopulationWithFilters)) * 100000))
          : 0;

          const name = this.selectedResolution === 'Municipal'
            ? this.getMunicipalityName(clave)
            : this.getStateName(Number(clave));

            dataCache.set(clave, { cases, population, rate, riskCases, riskRate, name });
      }
    });

    let maxCases = 0;
    let maxRate = 0;

    for (const data of dataCache.values()) {
      if (data.cases > maxCases) maxCases = data.cases;
      if (data.rate > maxRate) maxRate = data.rate;
    }

    this.highestValueInData = maxCases;
    this.highestRateInData = maxRate;

    // Create the cases layer (now synchronous with cached data)
    this.casesGeoJsonLayer = L.geoJSON(geoJson, {
      style: (feature: any | undefined) => {
        if (feature?.properties) {
          const data = dataCache.get(feature.properties.clave);
          const fillColor = this.getColorForValue(data?.cases ?? 0) || 'transparent';
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
          const data = dataCache.get(feature.properties.clave);
          if (data) {
            layer.bindPopup(
              `<table class="table">
                 <tbody>
                   <tr>
                     <th>${placeholder}</th>
                     <th>${data.name}</th>
                   </tr>
                   <tr>
                     <th>No. Casos</th>
                     <td>${data.cases.toLocaleString('en-US')}</td>
                   </tr>
                   <tr>
                     <th>No. Casos nivel ${this.selectedRegion != "Municipio" ? this.selectedRegion : "Estado"}</th>
                     <td>${this.totalCases.toLocaleString('en-US')}</td>
                   </tr>
                   <tr>
                     <th>Población</th>
                     <td>${data.population.toLocaleString('en-US')}</td>
                   </tr>
                   <tr>
                     <th>Población nivel ${this.selectedRegion != "Municipio" ? this.selectedRegion : "Estado"}</th>
                     <td>${this.totalPopulationWithFilters.toLocaleString('en-US')}</td>
                   </tr>
                   <tr>
                     <th>Tasa</th>
                     <td>${data.rate.toFixed(4)}</td>
                   </tr>
                   <tr>
                     <th>Razón de tasas</th>
                     <td>${data.riskCases.toFixed(4)}</td>
                   </tr>
                 </tbody>
               </table>`
            );
            layer.bindTooltip(`${placeholder + ": " + data.name} Casos: ${data.cases}`, { sticky: true });
          }
        }
      }
    });

    // Create the rate layer (now synchronous with cached data)
    this.rateGeoJsonLayer = L.geoJSON(geoJson, {
      style: (feature: any | undefined) => {
        if (feature?.properties) {
          const data = dataCache.get(feature.properties.clave);
          const fillColor = this.getColorForValue(data?.rate ?? 0, true) || '#ffffff';
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
          const data = dataCache.get(feature.properties.clave);
          if (data) {
            layer.bindPopup(
              `<table class="table">
                 <tbody>
                   <tr>
                     <th>${placeholder}</th>
                     <th>${data.name}</th>
                   </tr>
                   <tr>
                     <th>No. Casos</th>
                     <td>${data.cases.toLocaleString('en-US')}</td>
                   </tr>
                   <tr>
                     <th>No. Casos nivel ${this.selectedRegion != "Municipio" ? this.selectedRegion : "Estado"}</th>
                     <td>${this.totalCases.toLocaleString('en-US')}</td>
                   </tr>
                   <tr>
                     <th>Población</th>
                     <td>${data.population.toLocaleString('en-US')}</td>
                   </tr>
                   <tr>
                     <th>Población nivel ${this.selectedRegion != "Municipio" ? this.selectedRegion : "Estado"}</th>
                     <td>${this.totalPopulationWithFilters.toLocaleString('en-US')}</td>
                   </tr>
                   <tr>
                     <th>Tasa</th>
                     <td>${data.rate.toFixed(4)}</td>
                   </tr>
                   <tr>
                     <th>Razón de tasas</th>
                     <td>${data.riskRate.toFixed(4)}</td>
                   </tr>
                 </tbody>
               </table>`
            );
            layer.bindTooltip(`${feature.properties.clave} : ${placeholder + ": " + data.name} Tasa: ${data.rate.toFixed(2)}`, { sticky: true });
          }
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
    code = Number(code).toString()
    return this.municipalityNames[code] || environment.unknownMunicipality;
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    console.log("Change detected")
    try {
      let newResolution = changes['updatedResolution']['currentValue'];
      if (newResolution && newResolution != this.selectedResolution)  this.selectedResolution = newResolution;
    } catch (err) { console.log("no resolution updates"); }

    try {
      let year = changes['selectedYear']['currentValue'];
      if (year && typeof year[0] === 'number') {
        let numberYear = Number(year[0]).toString();
        console.log("Running data with: "+ this.selectedYear)
        this.selectedYear = numberYear;
      }
    } catch (err) { console.log("no year updates");}
    try {
      let year = changes['totalPopulationWithFilters']['currentValue'];
    } catch (err) { console.log("no year updates");}

    try {
      let dataToDisplayByMun = changes['dataByMunToDisplayInMap']['currentValue'];
      if (dataToDisplayByMun.length != 0) {
        this.rawDataTodisplayByMun = dataToDisplayByMun;
        let maxValue = 0;
        let maxRate = 0;
        if (this.selectedResolution === "Municipal") {
          for (const row of this.rawDataTodisplayByMun) {
            const value = row[2];           // number of cases
            const id = row[1];              // the ID to get population
          }
        } else {
          const stateSums = this.dataByMunToDisplayInMap.reduce((acc, row) => {
            const stateId = row[0];
            const cases = Number(row[2]);
            acc.set(stateId, (acc.get(stateId) || 0) + cases);
            return acc;
          }, new Map<number, number>());

        }
        this.highestValueInData = maxValue;
        this.highestRateInData = maxRate;

        await this.updateMapLayerView(this.selectedResolution);
      }
    } catch (err) {
      console.log("no updates in the data")
    }

    try {
      let newRegion = changes['updatedRegion']['currentValue'];
      if (newRegion && newRegion != this.selectedRegion) { this.selectedRegion = newRegion; }
    } catch (err) { console.log("no region updates");}
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

  async getPopulationById(id: string): Promise<number>{
    let year = this.selectedYear.toString();
    let cve_state = "";
    let cvegeo = "";
    let gender = this.selectedGender[0]

    if (this.selectedResolution === 'Municipal') cvegeo = Number(id).toString() ;
    else cve_state = id;

    let verifyGender = (this.selectedGender == "1" || this.selectedGender == "2" ) ? this.selectedGender : "";

    let age = (this.selectedAge != environment.placeholderAge) ? this.selectedAge : ""
    try {
      const response = await firstValueFrom(
        this.diseaseDB.getPopulationBy(
          year,
          cve_state || '',
          '',
          age || '',
          verifyGender || '',
          cvegeo || ''
        )
      );

      return response || 0;

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
  async getPop(claves: any){
    let populationMap: { [key: string]: number } = {};
    if (claves.length > 0) {
      try {
        if (this.selectedResolution === 'Municipal') {
          // For municipalities, pass cvegeos
          populationMap = await firstValueFrom(
            this.diseaseDB.getPopulationByCveList(
              this.selectedYear.toString(),
              [], // cve_state (empty for municipalities)
              (this.selectedAge && this.selectedAge !== environment.placeholderAge) ? this.selectedAge : '',
              this.selectedGender || '',
              claves // cvegeos
            )
          );
        } else {
          // For states, pass cve_states
          populationMap = await firstValueFrom(
            this.diseaseDB.getPopulationByCveList(
              this.selectedYear.toString(),
              claves, // cve_state
              (this.selectedAge && this.selectedAge !== environment.placeholderAge) ? this.selectedAge : '',
              this.selectedGender || '',
              [] // cvegeos (empty for states)
            )
          );
        }
      } catch (error) {
        console.error('Error fetching batch population:', error);
        Swal.fire({
          timer: 1500,
          title: 'Error al cargar los datos de población.',
          icon: 'error',
          showConfirmButton: false
        });
      }
    }
    return populationMap
  }
}
