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
  populationByYearList: [number, string, number][] = [];
  coloringMode: 'cases' | 'rate' = 'cases';
  private coloringControl: L.Control | undefined;

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
    if (this.currentGeoJsonLayer) {
      this.map.removeLayer(this.currentGeoJsonLayer);
      this.currentGeoJsonLayer = undefined;
    console.log('updating el layer');
    console.log(this.currentGeoJsonLayer);
    console.log('updating el layer');
    }
    if (this.currentLegend) {
      this.map.removeControl(this.currentLegend);
      this.currentLegend = undefined; // Important: set to undefined after removing
    console.log('mejor');
    console.log(this.currentLegend);
    console.log('mejor');
    }

    this.currentGeoJsonLayer = L.geoJSON(geoJson, {
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

      onEachFeature: (feature, layer) => {  // Changed to arrow function
        if (feature.properties) {
          const cases = this.numCasesByIdRegion(feature.properties.clave);
          const pop = this.getPopulationById(feature.properties.clave);
          const rate = pop ? (cases / pop) * 1000 : 0;
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
      },
    }).addTo(this.map);
    console.log("❄️❄️❄️❄️❄️❄️")

    this.currentLegend = this.createLegend();
    this.currentLegend.addTo(this.map);

    const bounds = this.currentGeoJsonLayer.getBounds();
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
        // Calculate the maximum value for the dynamic range

        let maxValue = 0;
        // if(this.selectedResolution == "Muncipal"){
        //   for (const row of this.rawDataTodisplayByMun) {
        //     const value = row[2];
        //     if (typeof value === 'number' && value > maxValue) {
        //       maxValue = value;
        //     }
        //   }
        // }
        if (this.selectedResolution == "Municipal") {
          // For municipal level, check individual municipal values
          for (const row of this.rawDataTodisplayByMun) {
            const value = row[2];
            if (typeof value === 'number' && value > maxValue) {
              maxValue = value;
            }
          }
        } else {
          // For state level, group by state ID and sum cases, then find maximum
          const stateSums = this.dataByMunToDisplayInMap
          .reduce((acc, row) => {
            const stateId = row[0];
            const cases = Number(row[2]);
            acc.set(stateId, (acc.get(stateId) || 0) + cases);
            return acc;
          }, new Map<number, number>());

          maxValue = Math.max(...stateSums.values());
        }
        console.log('Max value:', maxValue);

        this.highestValueInData = maxValue;
      }

    } catch (err) {
      console.log("no updates in the data")
    }
    this.updateMapLayerView(this.selectedResolution);
  }

  getColorForValue(value: number): string {
    let maxValue = this.highestValueInData;

    if (maxValue === 0) return '#DDDDDD'; // Avoid division by zero
    if (value === 0) return '#DDDDDD';

    // Define small quintuples (5 equal parts)
    if (maxValue <= 5) {
      const colors = ['#FFEDA0', '#FD8D3C', '#FC4E2A', '#E31A1C', '#800026'];
      const colorIndex = Math.min(value - 1, colors.length - 1);
      return colors[colorIndex];
    }

    // Handle larger datasets with quintuples
    const q_1 = Math.ceil(maxValue * (1.0 / 5.0));
    const q_2 = Math.ceil(maxValue * (2.0 / 5.0));
    const q_3 = Math.ceil(maxValue * (3.0 / 5.0));
    const q_4 = Math.ceil(maxValue * (4.0 / 5.0));

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
      // Get the max value for calculations
      const maxValue = this.highestValueInData;

      console.log('Legend - Max Value:', maxValue); // Debug log

      // Handle case where maxValue is 0 or undefined
      if (!maxValue || maxValue === 0) {
        div.innerHTML = `<h5>${environment.placeholderDataRange}</h5><p>${environment.placeholderNoData}</p>`;
        return div;
      }

      let ranges: any[] = [];

      // Handle small datasets differently
      if (maxValue <= 5) {
        // For very small ranges, create individual value ranges
        ranges.push({ color: '#DDDDDD', label: '0' });

        for (let i = 1; i <= maxValue; i++) {
          const colors = ['#FFEDA0', '#FD8D3C', '#FC4E2A', '#E31A1C', '#800026'];
          const colorIndex = Math.min(i - 1, colors.length - 1);
          ranges.push({
            color: colors[colorIndex],
            label: i.toString()
          });
        }
      } else {
        // For larger ranges, use quintiles but ensure no overlaps
        const q_1 = Math.ceil(maxValue * (1.0 / 5.0));
        const q_2 = Math.ceil(maxValue * (2.0 / 5.0));
        const q_3 = Math.ceil(maxValue * (3.0 / 5.0));
        const q_4 = Math.ceil(maxValue * (4.0 / 5.0));
        const q_5 = Math.ceil(maxValue * (5.0 / 5.0));

        ranges = [

          { color: '#DDDDDD', label: '0' },
          { color: '#FFEDA0', label: `1 - ${q_1}` },
          { color: '#FD8D3C', label: `${q_1 + 1} - ${q_2}` },
          { color: '#FC4E2A', label: `${q_2 + 1} - ${q_3}` },
          { color: '#E31A1C', label: `${q_3 + 1} - ${q_4}` },
          { color: '#800026', label: `${q_4 + 1} - ${q_5}` }
        ];

        // Filter out invalid ranges where start > end
        ranges = ranges.filter((range, index) => {
          if (index === 0) return true; // Keep the "0" range
          const parts = range.label.split(' - ');
          if (parts.length === 2) {
            const start = parseInt(parts[0]);
            const end = parseInt(parts[1]);
            return start <= end;
          }
          return true;
        });
      }
      // Create legend HTML
      div.innerHTML = `<h5>${environment.placeholderDataRange}</h5>`;

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
    if (this.coloringMode === 'cases') {
      return cases;
    }
    const pop = this.getPopulationById(id);
    return pop && pop > 0 ? (cases / pop) * 1000 : 0;
  }

  getPopulationById(id: string): number | null {
    const item = this.populationByYearList.find(subarray => Number(subarray[1]) == Number(id));
    return item ? item[2] : null;
  }
}
