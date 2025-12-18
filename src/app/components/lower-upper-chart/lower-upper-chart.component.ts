import { Component, Input, OnInit, SimpleChanges} from '@angular/core';
import { HighchartsChartComponent, ChartConstructorType } from 'highcharts-angular';

@Component({
  selector: 'app-lower-upper-chart',
  imports: [HighchartsChartComponent],
  templateUrl: './lower-upper-chart.component.html',
  styleUrl: './lower-upper-chart.component.css'
})
export class LowerUpperChartComponent implements OnInit{

    //  x: "categoria", y: "el punto", low: 0.87, high: 0.99 },
  //  te tengo que mandar categoria, el punto, low, high
  //  y aparte te tengo que mandar los nombres de, la enfermedad1, enferemedad2, enferemedad3, año, edad,genero, resolution? 😵‍💫

  @Input() data: any;
  womenData = [
    { category: "Rango 25", RR: 0.93, ICinf: 0.87, ICsup: 0.99 },
    { category: "Rango 28", RR: 0.90, ICinf: 0.84, ICsup: 0.96 },
    { category: "Rango 30", RR: 0.92, ICinf: 0.87, ICsup: 0.97 },
    { category: "Rango 31", RR: 0.89, ICinf: 0.84, ICsup: 0.94 },
    { category: "Rango 32", RR: 1.18, ICinf: 1.11, ICsup: 1.25 },
    { category: "Rango 33", RR: 1.15, ICinf: 1.08, ICsup: 1.22 },
    { category: "Rango 34", RR: 1.06, ICinf: 1.00, ICsup: 1.12 },
    { category: "Rango 37", RR: 0.98, ICinf: 0.92, ICsup: 1.04 },
    { category: "Rango 39", RR: 1.02, ICinf: 0.96, ICsup: 1.08 },
    { category: "Rango 42", RR: 1.03, ICinf: 0.96, ICsup: 1.10 }
  ];

  chartOptions: Highcharts.Options = {
    chart: {
      type: 'scatter',
      height: 400,
    },
    title: {
      text: 'Riesgo Relativo (RR) para TXX',
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    subtitle: {
      text: 'Enfermedades respiratorias | Años: 2000vs2019'
    },
    xAxis: {
      type: 'category',
      title: {
        text: 'Temperatura'
      },
      gridLineWidth: 1,
      gridLineColor: '#e0e0e0',
      categories: this.womenData.map(d => d.category)
    },
    yAxis: [
      {
        title: {
          text: 'Riesgo Relativo (RR)'
        },
        min: 0.8,
        max: 1.25,
        gridLineWidth: 1,
        gridLineColor: '#e0e0e0',
        tickPositions: [0.8, 0.9, 1, 1.1, 1.2, 1.3],
        plotLines: [{
          value: 1.0,
          color: '#999999',
          dashStyle: 'Dash',
          width: 2,
          zIndex: 5
        }]
      },
      {
        title: {
          text: ''
        },
        min: 0.8,
        max: 1.25,
        opposite: true,
        gridLineWidth: 0,
        labels: {
      enabled: false  // Add this to hide the labels
    }
      }
    ],
    legend: {
      enabled: true,
      align: 'right',
      verticalAlign: 'top',
      layout: 'vertical',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 5,
      padding: 10
    },
    plotOptions: {
      scatter: {
        marker: {
          radius: 5,
          symbol: 'circle'
        },
        tooltip: {
          headerFormat: '<b>{series.name}</b><br>',
          pointFormat: 'Temp: {point.x}°C<br>RR: {point.y:.2f}<br>IC: [{point.low:.2f} - {point.high:.2f}]'
        }
      },
      errorbar: {
        whiskerLength: 10,
        whiskerWidth: 2,
        color: undefined,
        stemWidth: 2
      }
    },
    series: [
      {
        name: 'MUJERES',
        type: 'scatter',
        yAxis: 1,
        data: this.womenData.map(d => ({
          name: d.category, // Use name instead of x for categories
          y: d.RR,
          low: d.ICinf,
          high: d.ICsup
        })),
        color: '#2f4f4f',
        marker: {
          symbol: 'circle'
        }
      } as any,
      {
        name: 'MUJERES',
        type: 'errorbar',
        yAxis: 1,
        data: this.womenData.map((d, index) => [index, d.ICinf, d.ICsup]),
          color: '#2f4f4f',
        linkedTo: ':previous',
        showInLegend: false,
        enableMouseTracking: false
      } as any
    ],
  };

  ngOnInit() {
    console.log("😵‍💫😵‍💫😵‍💫😵‍💫😵‍💫😵‍💫")
    console.log('Data on init:', this.data);
  }

}
