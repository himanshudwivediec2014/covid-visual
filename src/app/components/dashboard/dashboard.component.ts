import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthenticationService } from "../../services/authentication.service";
import { HttpService } from "../../services/http.service";
import * as Highcharts from 'highcharts';
import {forkJoin} from "rxjs";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isAuthenticated: boolean = false;

  constructor(
    private authService: AuthenticationService,
    private httpService: HttpService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(
      (value) => {
        if (value) {
          this.isAuthenticated = value;
        }
      }
    );
    if (!this.isAuthenticated) {
      this.router.navigate(['/login']);
    }

    this.getCovidData();
  }

  getCovidData() {
    forkJoin([
      this.httpService.getCovidJsonData(),
      this.httpService.getCovidSeriesData()
    ]).subscribe(
      (response: any) => {
        this.setTestedDataSeries(response[0]);
        this.setTimeSeriesData(response[1]);
      }
    )
  }

  setTimeSeriesData(result: any) {
    if (result && Object.keys(result).length) {
      const confirmedCases: any = [];
      const deceasedCases: any = [];
      const recoveredRateData: any = []
      const confirmedRateData: any = []
      Object.keys(result).map(key => {
        const dateWithMaxCases: any = Object.keys(result[key].dates).pop();
        if (
          result[key].dates[dateWithMaxCases].total
          && result[key].dates[dateWithMaxCases].total.deceased
          && result[key].dates[dateWithMaxCases].total.confirmed
          && result[key].dates[dateWithMaxCases].total.recovered
        ) {
          confirmedCases.push(result[key].dates[dateWithMaxCases].total.confirmed);
          deceasedCases.push(result[key].dates[dateWithMaxCases].total.deceased);

          confirmedRateData.push((result[key].dates[dateWithMaxCases].total.confirmed * 100)/result[key].dates[dateWithMaxCases].total.tested);
          recoveredRateData.push((result[key].dates[dateWithMaxCases].total.recovered * 100)/result[key].dates[dateWithMaxCases].total.confirmed);
        }
      });

      this.createTimeSeriesChart(confirmedCases, deceasedCases);

      this.createRateAnalysisChart(confirmedRateData, recoveredRateData);
    }
  }

  setTestedDataSeries(result: any) {
    if (result && Object.keys(result).length) {
      const testedSeriesData: any = [];

      Object.keys(result).map(key => {
        const totalTested = result[key].total.tested;
        const totalConfirmed = result[key].total.confirmed;
        testedSeriesData.push({
          name: key,
          x: totalTested,
          y: totalConfirmed,
          z: (totalConfirmed * 100)/totalTested,
        });
      });

      this.createTestedSeriesChart(testedSeriesData);
    }
  }

  createTestedSeriesChart(data: { name: string, x: number, y: number, z: number }[]) {
    // @ts-ignore
    Highcharts.chart('testing-chart-container', {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
      },
      title: {
        text: 'Total Tested Vs Confirmed COVID-19 cases'
      },
      tooltip: {
        pointFormat: '<span style="color:{point.color}">\u25CF</span> <b> {point.name}</b><br/>' +
          'Tested: <b>{point.x}</b><br/>' +
          'Confirmed: <b>{point.y}</b><br/>'
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}: Positivity Rate</b>: {point.z:.1f} %'
          }
        }
      },
      series: [{
        name: 'Brands',
        colorByPoint: true,
        data: data
      }],
      credits: {
        enabled: false
      },
    });
  }

  createTimeSeriesChart(confirmedSeriesData: number[], deceasedSeriesData: number[]) {
    // @ts-ignore
    Highcharts.chart('deceased-chart-container', {
      chart: {
        type: 'area'
      },
      accessibility: {
        description: 'Image description: An area chart compares the total confirmed cases vs total deceased cases'
      },
      title: {
        text: 'Total Confirmed Vs Deceased COVID-19 Cases'
      },
      subtitle: false,
      xAxis: {
        allowDecimals: false,
        accessibility: {
          rangeDescription: 'Range: 2020 to 2021.'
        }
      },
      yAxis: {
        title: {
          text: 'Population'
        }
      },
      tooltip: {
        headerFormat: null,
        pointFormat: '{series.name} <b>{point.y:,.0f}</b>'
      },
      plotOptions: {
        area: {
          pointStart: 0,
          marker: {
            enabled: false,
            symbol: 'circle',
            radius: 2,
            states: {
              hover: {
                enabled: true
              }
            }
          }
        }
      },
      series: [{
        name: 'Confirmed',
        data: [...confirmedSeriesData]
      }, {
        name: 'Deceased',
        data: [...deceasedSeriesData]
      }],
      credits: {
        enabled: false
      },
    });

  }

  createRateAnalysisChart(confirmedRateData: number[], recoveredRateData: number[]) {
    // @ts-ignore
    Highcharts.chart('recovered-chart-container', {
      chart: {
        type: 'bar'
      },
      title: {
        text: 'Total Confirmed vs Recovered COVID-19 Cases'
      },
      subtitle: false,
      xAxis: [{
        reversed: false,
        labels: {
          step: 1
        },
        accessibility: {
          description: 'Recovered'
        }
      }, {
        opposite: true,
        reversed: false,
        linkedTo: 0,
        labels: {
          step: 1
        },
        accessibility: {
          description: 'Confirmed'
        }
      }],
      yAxis: {
        title: {
          text: null
        },
        accessibility: {
          description: 'Percentage population',
          rangeDescription: 'Range: 0 to 5%'
        }
      },

      plotOptions: {
        series: {
          stacking: 'normal'
        }
      },

      tooltip: {
        formatter: function () {
          return '<b>' + this.series.name + ' Rate: ' +
            // @ts-ignore
            Highcharts.numberFormat(Math.abs(this.point.y), 1) + '%';
        }
      },

      series: [{
        name: 'Recovered',
        data: [...recoveredRateData]
      }, {
        name: 'Confirmed',
        data: [...confirmedRateData]
      }]
    });
  }
}
