import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { LoginService } from 'src/app/login.service';
import { NotificationService } from 'src/app/notification.service';
import { StorageService } from 'src/app/storage.service';
import { Chart, MapChart } from 'angular-highcharts';
import * as moment from 'moment';
import { PERIOD_TYPES}  from './../../periods.const';
import { Subscription } from 'rxjs';
import { FilterService } from '../../filter.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  indicators;

  seriesTypes = {
    ['SCREENING']: 'TRIAGENS REALIZADAS',
    ['PROBABILITY']: 'PROBABILIDADE DE CONTÁGIO',
    ['RISK']: 'NÍVEL DE RISCO',
    ['INFECTED']: 'INFECTADOS'
  }

  filterSub: Subscription;
  filters;

  period;

  lineData;
  lineCharts: Array<Chart> = [];
  listData;

  genderData;
  genderNames;
  genderList = [];
  ageData;
  ageList = [];
  charts: any[] = [];

  unitName = 'todas as unidades';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _filter: FilterService,
    public _auth: LoginService,
    public _storage: StorageService,
    public _app: AppService,
    public notification: NotificationService,
  ) {
    this.period = PERIOD_TYPES;
    this.filterSub = this._filter.getFilter().subscribe(filter => {
      if (filter) {
        console.log(filter.filter)
        this.filters[filter.filter.type] = filter.filter.value;
        if (filter.filter.type === 'unit') {
          this.filters.unitName = filter.filter.name;
          this.unitName = filter.filter.name;
        }
        this._storage.setData('Filters', this.filters)
        this.setData(this.filters);
      }
      console.log(this.filters);
    });
  }

  ngOnInit() {
    this.filters = this._storage.getData('Filters');
    this.unitName = this.filters.unitName;
    this.setData(this.filters);
  }

  setData(filters?) {
    console.log(this.filters)
    this.lineCharts = [];
    this.charts = [];
    this.getIndicators(filters.unit);
    this.getLineData(filters);
    this.getList(filters);
    this.getGenderData(filters);
    this.getAgeData(filters);
  }

  setFilters() {
    this.route.params.subscribe(params => {
      console.log(params);
    })
  }

  update() {
    this.setData(this.filters);
  }

  getIndicators(unit?) {
    this._app.getIndicators(unit).subscribe(
      response => {
        this.indicators = response;
        console.log(this.indicators)
      },
      error => {
        console.log(error);
        if (error.status === 401) {
          this.router.navigate(['login']);
        }
      }
    );
  }

  getLineData(filters?) {
    const period = this.period[filters.period].label;
    const unit = filters.unit === 0 ? '' : filters.unit;
    this._app.getLineData(period, unit).subscribe(
      response => {
        this.lineData = response;
        this.mountLineCharts(this.lineData.orgUnitSeries);
        console.log(response)
      },
      error => {
        console.log(error);
      }
    );
  }

  getList(filters?) {
    let period = this.period[filters.period].filter;
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...period, idOrgUnit: unit, comorbiditiesScore: ["HIGH", "MEDIUM_HIGH"] }
    this._app.getWorkplaceList(filter).subscribe(
      response => {
        this.listData = response;
        console.log(this.listData);
      },
      error => {
        console.log(error);
      }
    );
  }

  mountLineCharts(data) {
    data.map(item => {
      console.log(item);
      let chartData = {
        categories: [],
        data: [],
      };
      for (let type in item.series[0].dateAmount) {
        chartData.categories.push(type)
      }
      item.series.map(serie => {
        let values = [];
        for (let type in serie.dateAmount) {
          values.push(serie.dateAmount[type])
        }
        chartData.data.push({ data: values, type: undefined, name: this.seriesTypes[serie.serieType], marker: { symbol: 'circle' } });
      })
      this.lineCharts.push(
        new Chart({
          chart: {
            type: 'line',
            height: 300,
          },
          title: {
            text: ''
          },
          credits: {
            enabled: false
          },
          colors: ['#4a90e2', '#fd404b', '#f8e71c', '#bd10e0'],
          legend: {
            enabled: true,
            itemStyle: {
              color: '#a7a5a8',
              fontWeight: 'light',
              fontSize: '10px'
            }
          },
          xAxis: {
            categories: chartData.categories
          },
          // tooltip: {
          //   headerFormat: '',
          //   pointFormat: '<span style="color:{point.color}">\u25CF</span> <b> {name}: {point}</b><br/>'
          // },
          series: chartData.data
        })
      )
    })
  }

  getGenderData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getGenderData(filter).subscribe(
      response => {
        this.genderData = response;
        console.log(this.genderData)
        this.genderNames = Object.keys(this.genderData.groupCountMap);
      },
      error => {
        console.log(error);
      }
    );
  }

  getAgeData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getUserAgeData(filter).subscribe(
      response => {
        this.ageData = response;
        for (let age in this.ageData.groupCountMap) {
          this.charts.push(this.mountAgeChart({ x: this.ageData.groupCountMap[age], y: this.calcAgeTotal() - this.ageData.groupCountMap[age], title: age }));
          this.ageList.push(age);
        }
        console.log(response);
      },
      error => {
        console.log(error);
      }
    );
  }

  sumGenders() {
    let total: any = 0;
    for (let gender in this.genderData.groupCountMap) {
      total = total + this.genderData.groupCountMap[gender];
    }
    return total;
  }

  getPercent(gender) {
    if (this.genderData) {
      if (this.genderData.groupCountMap[gender]) {
        return ((this.genderData.groupCountMap[gender] * 100) / this.sumGenders()).toFixed(2);
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  generateTitle(title) {
    return `Gênero ${title} em`;
  }

  calcAgePercent(age) {
    const value = Math.round((this.ageData.groupCountMap[age] * 100) / this.calcAgeTotal())
    return Number.isNaN(value) ? 0 : value;
  }

  calcAgeTotal() {
    let total = 0;
    for (let age in this.ageData.groupCountMap) {
      total = total + this.ageData.groupCountMap[age];
    }
    return total;
  }

  mountAgeChart(data) {
    return new Chart({
      chart: {
        height: 150,
        type: 'pie'
      },
      title: {
          text: ''
      },
      credits: {
        enabled: false
      },
      colors: ['#7bd7fa', '#59b6d9'],
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
              enabled: false
          },
          showInLegend: false
        },
        series: {
          enableMouseTracking: false,
        }
      },
      series: [{
        animation: false,
        minPointSize: 10,
        innerSize: '80%',
        zMin: 0,
        name: 'faixa etária',
        data: [{
          name: '',
          y: data.y,
        }, {
          name: '',
          y: data.x,
        }],
        type: undefined
      }]
    });
  }

  formatAge(age) {
    return age.replace('-', '~')
  }

  ngOnDestroy() {
    this.filterSub.unsubscribe();
  }

}
