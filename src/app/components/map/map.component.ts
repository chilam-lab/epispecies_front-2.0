import { Component, OnInit, SimpleChanges, Input } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from './mapService';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DiseaseDbService } from '../../services/disease-db.service';

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
  @Input() dataByMunToDisplayInMap: [number, string, string][] = [];
  @Input() selectedCVEState: number = 0;
  @Input() selectedCVEMun: string = "";
  @Input() modelSelected: any;
  @Input() statesAndMunList: any = [];
  constructor(private mapService: MapService, private diseaseDB: DiseaseDbService) { }
  geoJsonLayerMunicipal: any;
  geoJsonLayerStates: any;
  currentLegend: L.Control | undefined;
  currentGeoJsonLayer: L.GeoJSON | undefined;
  selectedResolution: string = environment.placeholderStateResolution;
  rawDataTodisplayByMun: [number, string, string][] = [];
  highestValueInData = 0;
  highestRateInData = 0;
  populationByYearList: [number, string, number][] = [];
  coloringMode: 'cases' | 'rate' = 'cases';
  private coloringControl: L.Control | undefined;
  //currentLayerGroup: L.LayerGroup | undefined;
  currentLayerGroup: L.FeatureGroup | undefined;
  private layerControl: L.Control.Layers | undefined;



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

    this.diseaseDB.getDataByYearInTable("2019", environment.tablePopulationTotal)
      .subscribe({
        next: (response) => {
          this.populationByYearList = response;
          console.log("🎏🎏🎏🎏🎏");
          console.log(this.populationByYearList);
          console.log("🎏🎏🎏🎏🎏");
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
  onclick() {

  }


  updateMapLayerView(isStateOrMunicipality: string) {
    if (!this.map) return;

    let geoJson;
    if (isStateOrMunicipality === 'Municipal') { geoJson = this.geoJsonLayerMunicipal; }
    else { geoJson = this.geoJsonLayerStates };
    if (isStateOrMunicipality === 'Municipal') {
      //un minucupio
      if (this.selectedCVEMun.length > 0) {
        const filteredFeatures = geoJson.features.filter((feature: { properties: { cellid: number; clave: string; }; }) =>
          feature.properties.clave === this.selectedCVEMun.toString()
        );
        geoJson = {
          type: "FeatureCollection",
          features: filteredFeatures
        };
      } else {
        if(this.selectedCVEState !=0 ){
          let list = this.statesAndMunList.filter((item: any[]) => item[0] === this.selectedCVEState)
          let municipalityCodes = list.map((item: any[]) => Number(item[2]) > 10000 ? item[2] : "0" + item[2]);
          //los municipios del estado
          //traer la lista de los municipios e iterarla
          let filteredFeatures = geoJson.features.filter((feature: { properties: { cellid: number; clave: string; }; }) =>
            municipalityCodes.includes(feature.properties.clave)
          );
          geoJson = {
            type: "FeatureCollection",
            features: filteredFeatures
          };

        }
      }
    } else {
      console.log("this part is working fine")
      if (this.selectedCVEState > 0) {
        const filteredFeatures = geoJson.features.filter((feature: { properties: { cellid: number; clave: string; }; }) =>
          feature.properties.cellid === this.selectedCVEState
        );
        geoJson = {
          type: "FeatureCollection",
          features: filteredFeatures
        };
      }
    }



    console.log('GeoJSON:', geoJson);
    if (this.currentLayerGroup) {
      this.map.removeLayer(this.currentLayerGroup);
      this.currentLayerGroup = undefined;
    }
    // if (this.currentGeoJsonLayer) {
    //   this.map.removeLayer(this.currentGeoJsonLayer);
    //   this.currentGeoJsonLayer = undefined;
    // console.log('updating el layer');
    // console.log(this.currentGeoJsonLayer);
    // console.log('updating el layer');
    // }
    if (this.currentLegend) {
      this.map.removeControl(this.currentLegend);
      this.currentLegend = undefined; // Important: set to undefined after removing
    console.log('mejor');
    console.log(this.currentLegend);
    console.log('mejor');
    }

    // this.currentGeoJsonLayer = L.geoJSON(geoJson, {
    //   style: (feature: any | undefined) => {
    //     if (feature?.properties) {
    //       const value = this.getValueForRegion(feature.properties.clave);
    //       const fillColor = this.getColorForValue(this.numCasesByIdRegion(feature.properties.clave)) || '#ffffff';
    //       return {
    //         fillColor, // Now guaranteed to be a string
    //         weight: 0.5,
    //         opacity: 1,
    //         color: '#000000',
    //         fillOpacity: 0.7,
    //       };
    //     }
    //     return {
    //       fillColor: '#ffffff',
    //       weight: 0.5,
    //       opacity: 1,
    //       color: '#000000',
    //       fillOpacity: 0.7,
    //     };
    //   },
    //
    //   onEachFeature: (feature, layer) => {  // Changed to arrow function
    //     if (feature.properties) {
    //       const cases = this.numCasesByIdRegion(feature.properties.clave);
    //       const pop = this.getPopulationById(feature.properties.clave);
    //       const rate = pop ? (cases / pop) * 100000 : 0;
    //       layer.bindPopup(
    //         `<table class="table">
    //            <thead>
    //              <tr>
    //                <th scope="col">Clave</th>
    //                <th scope="col">No. Casos</th>
    //                <th scope="col">Población</th>
    //                <th scope="col">Tasa</th>
    //              </tr>
    //            </thead>
    //            <tbody>
    //              <tr>
    //                <th>${feature.properties.clave}</th>
    //                <td>${cases}</td>
    //                <td>${pop?.toLocaleString('en-US')}</td>
    //                <td>${rate.toFixed(4)}</td>
    //              </tr>
    //            </tbody>
    //          </table>`
    //       );
    //       layer.bindTooltip(`Clave: ${feature.properties.clave} cases: ${this.numCasesByIdRegion(feature.properties.clave)}`, { sticky: true });
    //     }
    //   },
    // }).addTo(this.map);
    // console.log("❄️❄️❄️❄️❄️❄️")
    //
    const casesStyleLayer = L.geoJSON(geoJson, {
     style: (feature: any | undefined) => {
        if (feature?.properties) {
          const value = this.getValueForRegion(feature.properties.clave);
          const fillColor = this.getColorForValue(this.numCasesByIdRegion(feature.properties.clave)) || '#ffffff';
          return {
            fillColor, // Now guaranteed to be a string
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
          fillOpacity: 0.7,
        };
      },
      onEachFeature: (feature, layer) => {
       if (feature.properties) {
           const cases = this.numCasesByIdRegion(feature.properties.clave);
          const pop = this.getPopulationById(feature.properties.clave);
          const rate = pop ? (cases / pop) * 100000 : 0;
          layer.bindPopup(
            `<table class="table">
               <thead>
                 <tr>
                   <th scope="col">Clave</th>
                   <th scope="col">No. Casos</th>
                   <th scope="col">Población</th>
                   <th scope="col">Tasa</th>
                 </tr>
               </thead>
               <tbody>
                 <tr>
                   <th>${feature.properties.clave}</th>
                   <td>${cases}</td>
                   <td>${pop?.toLocaleString('en-US')}</td>
                   <td>${rate.toFixed(4)}</td>
                 </tr>
               </tbody>
             </table>`
          );
          layer.bindTooltip(`Clave: ${feature.properties.clave} cases: ${this.numCasesByIdRegion(feature.properties.clave)}`, { sticky: true });
        }
      }
    });

    // const rateStyleLayer = L.geoJSON(geoJson, {
    //   style: (feature: any) => ({
    //     fillColor: 'blue',   // 👈 example alternative coloring
    //     weight: 0.5,
    //     opacity: 1,
    //     color: '#000000',
    //     fillOpacity: 0.3,
    //   }),
    //   onEachFeature: (feature, layer) => {
    //     layer.bindPopup(`Alt Style → Clave: ${feature.properties.clave}`);
    //   }
    // });
    const rateStyleLayer = L.geoJSON(geoJson, {
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
          fillOpacity: 0.7,
        };
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          const cases = this.numCasesByIdRegion(feature.properties.clave);
          const pop = this.getPopulationById(feature.properties.clave);
          const rate = pop ? (cases / pop) * 100000 : 0;
          layer.bindPopup(
            `<table class="table">
               <thead>
                 <tr>
                   <th scope="col">Clave</th>
                   <th scope="col">No. Casos</th>
                   <th scope="col">Población</th>
                   <th scope="col">Tasa</th>
                 </tr>
               </thead>
               <tbody>
                 <tr>
                   <th>${feature.properties.clave}</th>
                   <td>${cases}</td>
                   <td>${pop?.toLocaleString('en-US')}</td>
                   <td>${rate.toFixed(4)}</td>
                 </tr>
               </tbody>
             </table>`
          );
          layer.bindTooltip(`Clave: ${feature.properties.clave} tasa: ${rate.toFixed(2)}`, { sticky: true });
        }
      }
    });

//     this.currentLayerGroup = L.layerGroup([casesStyleLayer, rateStyleLayer]);
     this.currentLayerGroup = L.featureGroup([casesStyleLayer, rateStyleLayer]);


  // Add group to map
  //this.currentLayerGroup.addTo(this.map);
  const baseLayers = {
  "Número de casos": casesStyleLayer,
  "Tasa por 100,000": rateStyleLayer
};

// If control already exists, remove and rebuild it
if (this.layerControl) {
  this.map.removeControl(this.layerControl);
}

this.layerControl = L.control.layers(baseLayers, {}, { collapsed: false }).addTo(this.map);

casesStyleLayer.addTo(this.map)
    this.currentLegend = this.createLegend();
    this.currentLegend.addTo(this.map);

    // const bounds = this.currentGeoJsonLayer.getBounds();
    const bounds = this.currentLayerGroup.getBounds();
    if (bounds.isValid()) {
      this.map.fitBounds(bounds);
    } else {
      this.map.setView([11.87, -81.58], 5);
    }
  }

  selectedRegion(isStateOrMunicipality: string, geoJson: { features: any; type?: string; }) {

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

  ngOnChanges(changes: SimpleChanges): void {
    console.log("🍥🍥🍥🍥🍥🍥🍥")
    console.log(changes)
    console.log("🍥🍥🍥🍥🍥🍥🍥")
    try {
      let newResolution = changes['updatedResolution']['currentValue'];
      if (newResolution && newResolution != this.selectedResolution) {
        this.selectedResolution = newResolution;
      }
    } catch (err) {
      console.log("no resolution updates");
    }

    try {
      let dataToDisplayByMun = changes['dataByMunToDisplayInMap']['currentValue'];
      if (dataToDisplayByMun.length != 0) {
        this.rawDataTodisplayByMun = dataToDisplayByMun;

        // Calculate both maximum cases and maximum rate
        let maxCases = 0;
        let maxRate = 0;

        if (this.selectedResolution == "Municipal") {
          // For municipal level, check individual municipal values
          for (const row of this.rawDataTodisplayByMun) {
            const cases = Number(row[2]);
            const municipalId = row[1];

            // Update max cases
            if (cases > maxCases) {
              maxCases = cases;
            }

            // Calculate and update max rate
            const population = this.getPopulationById(municipalId);
            if (population && population > 0) {
              const rate = (cases / population) * 100000;
              if (rate > maxRate) {
                maxRate = rate;
              }
            }
          }
        } else {
          // For state level, group by state ID and calculate both sums and rates
          const stateData = new Map<number, { cases: number, population: number }>();

          // First, aggregate cases and population by state
          for (const row of this.dataByMunToDisplayInMap) {
            const stateId = row[0];
            const cases = Number(row[2]);
            const municipalId = row[1];
            const population = this.getPopulationById(municipalId) || 0;

            if (stateData.has(stateId)) {
              const existing = stateData.get(stateId)!;
              stateData.set(stateId, {
                cases: existing.cases + cases,
                population: existing.population + population
              });
            } else {
              stateData.set(stateId, { cases, population });
            }
          }

          // Now find max cases and max rate
          for (const [stateId, data] of stateData) {
            // Update max cases
            if (data.cases > maxCases) {
              maxCases = data.cases;
            }

            // Calculate and update max rate
            if (data.population > 0) {
              const rate = (data.cases / data.population) * 100000;
              if (rate > maxRate) {
                maxRate = rate;
              }
            }
          }
        }

        console.log('Max cases:', maxCases);
        console.log('Max rate:', maxRate);

        this.highestValueInData = maxCases;
        this.highestRateInData = maxRate;
      }
    } catch (err) {
      console.log("no updates in the data")
    }

    this.updateMapLayerView(this.selectedResolution);
  }
  getColorForValue(value: number, isRate: boolean = false): string {
    const maxValue = isRate ? this.highestRateInData : this.highestValueInData;

    if (maxValue === 0) return '#DDDDDD';
    if (value === 0) return '#DDDDDD';

    // Define small ranges (5 equal parts)
    if (maxValue <= 5) {
      const colors = ['#FFEDA0', '#FD8D3C', '#FC4E2A', '#E31A1C', '#800026'];
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

  createLegend(): L.Control {
    const legend = new L.Control({ position: 'bottomleft' });

    legend.onAdd = (map) => {
      const div = L.DomUtil.create('div', 'info legend');

      // Determine which max value to use based on current mode
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
        const q_1 = maxValue * (1.0 / 5.0);
        const q_2 = maxValue * (2.0 / 5.0);
        const q_3 = maxValue * (3.0 / 5.0);
        const q_4 = maxValue * (4.0 / 5.0);
        const q_5 = maxValue;

        const formatValue = (val: number) =>
          this.coloringMode === 'rate' ? val.toFixed(2) : Math.ceil(val).toString();

        ranges = [
          { color: '#DDDDDD', label: '0' },
          { color: '#FFEDA0', label: `0.01 - ${formatValue(q_1)}` },
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
  getStyle(){
  }
}
