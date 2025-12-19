import { Component, Input, OnInit, SimpleChanges} from '@angular/core';
import { HighchartsChartComponent, ChartConstructorType } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { environment, gendersDict, nameCategories } from '../../../environments/environment';

@Component({
  selector: 'app-lower-upper-chart',
  imports: [HighchartsChartComponent],
  templateUrl: './lower-upper-chart.component.html',
  styleUrl: './lower-upper-chart.component.css'
})
export class LowerUpperChartComponent implements OnInit{
  @Input() data: any = [];
  @Input() selectedFirstClassName: any ="";
  @Input() selectedSecondClassName: any ="";
  @Input() selectedThirdClassName: any ="";
  @Input() selectedAgeHelper: string ="";
  @Input() selectedGender: any ="";
  @Input() selectedRegion: string ="";
  @Input() selectedYear: string ="";

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  womenData = [
    { category: "Rango_25", RR: 0.93, ICinf: 0.87, ICsup: 0.99 },
    { category: "Rango_28", RR: 0.90, ICinf: 0.84, ICsup: 0.96 },
    { category: "Rango_30", RR: 0.92, ICinf: 0.87, ICsup: 0.97 },
    { category: "Rango_31", RR: 0.89, ICinf: 0.84, ICsup: 0.94 },
    { category: "Rango_32", RR: 1.18, ICinf: 1.11, ICsup: 1.25 },
    { category: "Rango_33", RR: 1.15, ICinf: 1.08, ICsup: 1.22 },
    { category: "Rango_34", RR: 1.06, ICinf: 1.00, ICsup: 1.12 },
    { category: "Rango_37", RR: 0.98, ICinf: 0.92, ICsup: 1.04 },
    { category: "Rango_39", RR: 1.02, ICinf: 0.96, ICsup: 1.08 },
    { category: "Rango_42", RR: 1.03, ICinf: 0.96, ICsup: 1.10 }
  ];

  ngOnInit() {
    this.data?.sort((a:any, b:any) => {
      const rangeA = a.category.split('_')[1];
      const rangeB = b.category.split('_')[1];
      const lowerA = parseFloat(rangeA.split('-')[0]);
      const lowerB = parseFloat(rangeB.split('-')[0]);
      return lowerA - lowerB;
    });

    const chartData = this.data.length > 0 ? this.data : this.womenData;
    const prefix = chartData[0].category.split('_')[0];
    const categoryName = nameCategories[prefix as keyof typeof nameCategories] || 'Categoría desconocida'

    const round2 = (num: number) => Math.round(num * 100) / 100;
    const categories = chartData.map((d: any) => d.category);
    const maxICsup = Math.max(...chartData.map((d:any) => d.ICsup));
    const minICinf = Math.min(...chartData.map((d:any) => d.ICinf));
    let subTitle = (this.selectedFirstClassName != environment.placeholderFirstClass) ? this.selectedFirstClassName : ""
    subTitle += (this.selectedSecondClassName) ? `, ${this.selectedSecondClassName}` : "";
    subTitle += (this.selectedThirdClassName) ? `, ${this.selectedThirdClassName}` : "";
    subTitle += (this.selectedAgeHelper == environment.placeholderAge) ? `, ${this.selectedAgeHelper}` :  `, Grupo de edad: ${this.selectedAgeHelper}`;
    subTitle += (this.selectedGender == environment.placeholderGender) ?
      `, ${this.selectedGender}` :
      `, Género: ${gendersDict[this.selectedGender]}`;
    subTitle += (this.selectedYear) ? `, Año: ${this.selectedYear[0]}` : ""
    const padding = 0.01;
    const lowerBound = minICinf - padding;
    const upperBound = maxICsup + padding;

    const lowerInterval = (1 - lowerBound) / 4;
    const lowerTicks = [
      round2(lowerBound),
      round2(lowerBound + lowerInterval),
      round2(lowerBound + lowerInterval * 2),
      round2(lowerBound + lowerInterval * 3)
    ];

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
        backgroundColor: '#f8fbff'
      },
      title: {
        text: 'Riesgo Relativo (RR) para TXX',
        style: {
          fontSize: '16px',
          fontWeight: 'bold'
        }
      },
      subtitle: {
        text: subTitle
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
            pointFormat: '<br>Riesgo Relativo: {point.y:.2f}<br>Limites: [{point.low:.2f} - {point.high:.2f}]'
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
          name: categoryName,
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
          name: categoryName,
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
