import { Component } from '@angular/core';
import { HighchartsChartComponent, ChartConstructorType } from 'highcharts-angular';

@Component({
  selector: 'app-lower-upper-chart',
  imports: [HighchartsChartComponent],
  templateUrl: './lower-upper-chart.component.html',
  styleUrl: './lower-upper-chart.component.css'
})
export class LowerUpperChartComponent {
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'scatter'  // Or 'line' if you want connected points
    },
    title: {
      text: 'Riesgo Relativo (RR) para TXX - Enfermedades respiratorias | Años: 2000vs2019'
    },
    subtitle: { text: 'HOMBRES' },  // You can add another chart for women
    xAxis: {
      title: { text: 'Temperatura' },
      categories: ['<25', '25-30', '30-35', '35-40', '>40']  // Approximate from image
    },
    yAxis: {
      title: { text: 'Riesgo Relativo (RR)' },
      type: 'logarithmic',  // Important for your scale around 1.0
      minorTickInterval: 0.1
    },
    series: [
      {
        type: 'scatter',
        name: 'RR Hombres',
        data: [1.05, 0.95, 1.15, 1.10, 1.00],  // Example point values – replace with your data
        marker: { radius: 5 }
      },
      {
        type: 'errorbar',
        name: 'Intervalos de confianza',
        linkedTo: ':previous',  // Links to the previous series
        data: [
          [0.95, 1.15],  // [low, high] for first point
          [0.85, 1.05],
          [1.05, 1.25],
          [1.00, 1.20],
          [0.90, 1.10]
        ],
        whiskerLength: 20
      }
    ]
  };
}
