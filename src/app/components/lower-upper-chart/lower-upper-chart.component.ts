import { Component } from '@angular/core';
import { HighchartsChartComponent, ChartConstructorType } from 'highcharts-angular';

@Component({
  selector: 'app-lower-upper-chart',
  imports: [HighchartsChartComponent],
  templateUrl: './lower-upper-chart.component.html',
  styleUrl: './lower-upper-chart.component.css'
})
export class LowerUpperChartComponent {


    womenData = [
      { x: 25, y: 0.93, low: 0.87, high: 0.99 },
      { x: 28, y: 0.90, low: 0.84, high: 0.96 },
      { x: 30, y: 0.92, low: 0.87, high: 0.97 },
      { x: 31, y: 0.89, low: 0.84, high: 0.94 },
      { x: 32, y: 1.18, low: 1.11, high: 1.25 },
      { x: 33, y: 1.15, low: 1.08, high: 1.22 },
      { x: 34, y: 1.06, low: 1.00, high: 1.12 },
      { x: 37, y: 0.98, low: 0.92, high: 1.04 },
      { x: 39, y: 1.02, low: 0.96, high: 1.08 },
      { x: 42, y: 1.03, low: 0.96, high: 1.10 }
    ];
  chartOptions: Highcharts.Options = {
    chart: {
    type: 'scatter',
    height: '100%',
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
    title: {
      text: 'Temperatura'
    },
    min: 24,
    max: 43,
    gridLineWidth: 1,
    gridLineColor: '#e0e0e0'
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
        text: 'Riesgo Relativo (RR)'
      },
      min: 0.8,
      max: 1.25,
      opposite: true,
      gridLineWidth: 0,
      // Remove plotLines from second y-axis to eliminate duplicate dash line
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
      whiskerLength: 10, // Change from 0 to add the T-shaped caps
      whiskerWidth: 2,   // Add width for the whisker caps
      color: undefined,
      stemWidth: 2
    }
  },
  series: [
    {
      name: 'MUJERES',
      type: 'scatter',
      yAxis: 1,
      data: this.womenData.map(d => ({ x: d.x, y: d.y, low: d.low, high: d.high })),
      color: '#2f4f4f',
      marker: {
        symbol: 'circle'
      }
    } as any,
    {
      name: 'MUJERES',
      type: 'errorbar',
      yAxis: 1,
      data: this.womenData.map(d => [d.x, d.low, d.high]),
      color: '#2f4f4f',
      linkedTo: ':previous',
      showInLegend: false,
      enableMouseTracking: false
    } as any
  ],
          };
}
