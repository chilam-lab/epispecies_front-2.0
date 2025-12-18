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
    series: [
      {
        data: [1, 2, 3],
        type: 'line',
      },
    ],
  };
}
