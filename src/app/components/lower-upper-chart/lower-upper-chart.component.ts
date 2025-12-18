import { Component, Input, OnInit, SimpleChanges} from '@angular/core';
import { HighchartsChartComponent, ChartConstructorType } from 'highcharts-angular';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-lower-upper-chart',
  imports: [HighchartsChartComponent],
  templateUrl: './lower-upper-chart.component.html',
  styleUrl: './lower-upper-chart.component.css'
})
export class LowerUpperChartComponent implements OnInit{

  //  y aparte te tengo que mandar los nombres de, la enfermedad1, enferemedad2, enferemedad3, año, edad,genero, resolution? 😵‍💫

  @Input() data: any = [];
  @Input() selectedFirstClassName: string ="";
  @Input() selectedSecondClassName: string ="";
  @Input() selectedThirdClassName: string ="";
  @Input() selectedAgeHelper: string ="";
  @Input() selectedGender: string ="";
  @Input() selectedRegion: string ="";
  @Input() selectedYear: string ="";

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
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



  ngOnInit() {
    console.log("😵‍💫😵‍💫😵‍💫😵‍💫😵‍💫😵‍💫")
    console.log('Data on init:', this.selectedFirstClassName);
    console.log('Data on init:', this.selectedSecondClassName);
    console.log('Data on init:', this.selectedThirdClassName);
    console.log('Data on init:', this.selectedAgeHelper);
    console.log('Data on init:', this.selectedGender);
    console.log('Data on init:', this.selectedRegion);
    console.log('Data on init:', this.selectedYear);
    console.log('Data on init:', this.data);
    this.data?.sort((a:any, b:any) => {
      const rangeA = a.category.split('_')[1];
      const rangeB = b.category.split('_')[1];

      const lowerA = parseFloat(rangeA.split('-')[0]);
      const lowerB = parseFloat(rangeB.split('-')[0]);

      return lowerA - lowerB;
    });
    const chartData = this.data.length > 0 ? this.data : this.womenData;


const round2 = (num: number) => Math.round(num * 100) / 100;
    const categories = chartData.map((d: any) => d.category);

    const maxICsup = Math.max(...chartData.map((d:any) => d.ICsup));
    console.log('Highest ICsup:', maxICsup);

    // Lowest ICinf
    const minICinf = Math.min(...chartData.map((d:any) => d.ICinf));
    console.log('Lowest ICinf:', minICinf);
    const padding = 0.01;
    const lowerBound = minICinf - padding;
    const upperBound = maxICsup + padding;

    // Calculate 3 evenly spaced points between lower bound and 1
    const lowerInterval = (1 - lowerBound) / 4;
    const lowerTicks = [
      round2(lowerBound),
      round2(lowerBound + lowerInterval),
      round2(lowerBound + lowerInterval * 2),
      round2(lowerBound + lowerInterval * 3)
    ];

    // Calculate 3 evenly spaced points between 1 and upper bound
    const upperInterval = (upperBound - 1) / 4;
    const upperTicks = [
      round2(1 + upperInterval),
      round2(1 + upperInterval * 2),
      round2(1 + upperInterval * 3),
      round2(upperBound)
    ];

    const uniqueTicks = [...lowerTicks, 1, ...upperTicks];

    this.chartOptions = {
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
        categories: categories
      },
      yAxis: {
  title: {
    text: 'Riesgo Relativo (RR)'
  },
  min: lowerBound,
  max: upperBound,
  gridLineWidth: 1,
  gridLineColor: '#e0e0e0',
  tickPositions: uniqueTicks,
  plotLines: [{
    value: 1.0,
    color: '#999999',
    dashStyle: 'Dash',
    width: 2,
    zIndex: 5
  }]
},
      legend: {
        enabled: false,
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
          yAxis: 0,
          data: chartData.map((d:any) => ({
            name: d.category,
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
          yAxis: 0,
          data: chartData.map((d:any, index:any) => [index, d.ICinf, d.ICsup]),
            color: '#2f4f4f',
          linkedTo: ':previous',
          showInLegend: false,
          enableMouseTracking: false
        } as any
      ],
    };
  }

}
