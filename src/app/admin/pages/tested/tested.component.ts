import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { LoginService } from 'src/app/login.service';
import { NotificationService } from 'src/app/notification.service';
import { StorageService } from 'src/app/storage.service';
import { Chart, MapChart } from 'angular-highcharts';
import * as moment from 'moment';
import { PERIOD_TYPES}  from './../../periods.const';
import { Subscription } from 'rxjs';
import { FilterService } from '../../filter.service';
import { ModalService } from '../../modal.service';

@Component({
  selector: 'app-tested',
  templateUrl: './tested.component.html',
  styleUrls: ['./tested.component.scss']
})
export class TestedComponent implements OnInit, OnDestroy {
  indicators;
  testTypeData;
  testResultData;
  testTypeLists = [];
  testResultLists = [];
  barChart: Chart;
  chart: Chart;

  filterSub: Subscription;
  filters;

  period;

  messageSub: Subscription;

  unitName = 'todas as unidades';

  constructor(
    private router: Router,
    public _auth: LoginService,
    public _storage: StorageService,
    public _app: AppService,
    private _filter: FilterService,
    private _msgModal: ModalService,
    public notification: NotificationService
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
    this.messageSub = this._msgModal.getMessage().subscribe(message => {
      if (message.message && message.page === 'tested') {
        let filter = null; 
        if (message.id !== undefined) {
          this._app.sendMessage({ msg: message.message, idUser: message.id }).subscribe(response => {
            this.notification.success('Mensagem enviada!')
            console.log(response)
          },
          error => {
            this.notification.error('Algo deu errado. Tente novamente.')
            console.log(error);
            if (error.status === 401) {
              this.router.navigate(['login']);
            }
          });
        } else {
          if (message.filter !== undefined) {
            filter = message.filter;
          } else {
            let filters = this._storage.getData('Filters');
            let unit = filters.unit === 0 ? null : filters.unit;
            filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
          }
          this._app.sendMessage({ filter, msg: message.message }).subscribe(response => {
            this.notification.success('Mensagens enviadas!')
            console.log(response)
          },
          error => {
            this.notification.error('Algo deu errado. Tente novamente.')
            console.log(error);
            if (error.status === 401) {
              this.router.navigate(['login']);
            }
          });
        }
        console.log(message)
      }
    })
  }

  ngOnInit() {
    this.filters = this._storage.getData('Filters');
    this.unitName = this.filters.unitName;
    this.setData(this.filters);
  }

  setData(filters?) {
    this.testTypeLists = [];
    this.testResultLists = [];
    this.getIndicators(filters.unit);
    this.getTestTypeData(filters);
    this.getTestResultData(filters);
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

  getTestTypeData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getTestTypeData(filter).subscribe(
      response => {
        this.testTypeData = response;
        this.mountBarChart(this.testTypeData.groupCountMap);
        this.getTestTypeLists(filter)
        console.log(response)
      },
      error => {
        console.log(error);
      }
    );
  }

  getTestResultData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getTestResultData(filter).subscribe(
      response => {
        this.testResultData = response;
        this.mountChart(this.testResultData.groupCountMap);
        this.getTestResultLists(filter);
        console.log(response)
      },
      error => {
        console.log(error);
      }
    );
  }

  getTestTypeLists(filter) {
    for (let type in this.testTypeData.groupCountMap) {
      this._app.getWorkplaceList({ ...filter, testType: type }).subscribe(
        response => {
          this.testTypeLists.push({...response, type: type, filter: { ...filter, testType: type }});
          console.log(response)
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  getTestResultLists(filter) {
    for (let result in this.testResultData.groupCountMap) {
      this._app.getWorkplaceList({ ...filter, test: result }).subscribe(
        response => {
          this.testResultLists.push({...response, type: result, filter: { ...filter, test: result }});
          console.log(response)
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  createLegend() {
    let legendList = [];
    for (let legend in this.testResultData.groupCountMap) {
      legendList.push(legend);
    }
    return legendList;
  }

  calcTotal(data) {
    let total = 0;
    for (let item in data) {
      total = total + data[item]
    }
    return total;
  }

  calcPercent(total, value) {
    return (value * 100) / total;
  }

  mountBarChart(data) {
    let barData = [];
    for (let type in data) {
      barData.push({ name: type, y: data[type] });
    }
    this.barChart = new Chart(
      {
        chart: {
            type: 'column',
            height: 300
        },
        title: {
            text: ''
        },
        credits: {
          enabled: false
        },
        colors: ['#644c01', '#735b0d', '#a18118'],
        accessibility: {
            announceNewData: {
                enabled: true
            }
        },
        xAxis: {
            type: 'category',
            labels: {
              autoRotation: false
            }
        },
        yAxis: {
            title: {
                text: ''
            }
    
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b><br/>'
        },
        series: [
            {
                name: "Tipos de teste",
                colorByPoint: true,
                type: undefined,
                data: barData
            }
        ]
    }
    );
  }

  mountChart(data) {
    let chartData = [];
    for (let result in data) {
      chartData.push({ name: this.calcPercent(this.calcTotal(data), data[result]).toFixed(2) + '%', y: data[result], z: result });
    }
    this.chart = new Chart({
      chart: {
        type: 'pie',
        height: 260,
      },
      title: {
          text: ''
      },
      credits: {
        enabled: false
      },
      colors: ['#fd404b', '#f8e71c', '#f59600', '#3fa9e8'],
      plotOptions: {
        series: {
          enableMouseTracking: true,
        }
      },
      tooltip: {
        headerFormat: '',
        pointFormat: '<span style="color:{point.color}">\u25CF</span> <b> {point.z}: {point.y}</b><br/>'
      },
      series: [{
        animation: false,
        minPointSize: 10,
        innerSize: '60%',
        zMin: 0,
        name: 'local de trabalho',
        data: chartData,
        type: undefined
      }]
    });
  }

  verifyObj(obj) {
    return Object.keys(obj).length !== 0 && obj.constructor === Object;
  }

  ngOnDestroy() {
    this.filterSub.unsubscribe();
    this.messageSub.unsubscribe();
  }

}
