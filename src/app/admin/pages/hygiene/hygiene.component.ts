import { Component, OnInit, OnDestroy } from '@angular/core';
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
  selector: 'app-hygiene',
  templateUrl: './hygiene.component.html',
  styleUrls: ['./hygiene.component.scss']
})
export class HygieneComponent implements OnInit, OnDestroy {
  indicators;
  epiData;
  epiChart: Chart;
  epiLists = [];
  knowData;
  knowChart: Chart;
  knowLists = [];

  filterSub: Subscription;
  filters;

  period;

  messageSub: Subscription;

  unitName = 'todas as unidades';

  constructor(
    private router: Router,
    private _filter: FilterService,
    public _auth: LoginService,
    public _storage: StorageService,
    public _app: AppService,
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
      if (message.message && message.page === 'hygiene') {
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
    this.epiLists = [];
    this.knowLists = [];
    this.getIndicators(filters.unit);
    this.getEpiData(filters);
    this.getKnowData(filters);
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

  getEpiData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getEpiData(filter).subscribe(
      response => {
        this.epiData = response;
        this.mountEpiChart(this.epiData.groupCountMap);
        this.getEpiLists(filter)
        console.log(this.epiData)
      },
      error => {
        console.log(error);
      }
    );
  }

  getKnowData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getKnowData(filter).subscribe(
      response => {
        this.knowData = response;
        this.mountKnowChart(this.knowData.groupCountMap);
        this.getKnowLists(filter)
        console.log(this.knowData)
      },
      error => {
        console.log(error);
      }
    );
  }

  getEpiLists(filter) {
    for (let result in this.epiData.groupCountMap) {
      this._app.getWorkplaceList({ ...filter, products: result }).subscribe(
        response => {
          this.epiLists.push({...response, type: result, filter: { ...filter, products: result }});
          console.log(response)
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  getKnowLists(filter) {
    for (let result in this.knowData.groupCountMap) {
      this._app.getWorkplaceList({ ...filter, protect: result }).subscribe(
        response => {
          this.knowLists.push({...response, type: result, filter: { ...filter, protect: result }});
          console.log(response)
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  createLegend(data) {
    let legendList = [];
    for (let legend in data.groupCountMap) {
      legendList.push(legend);
    }
    return legendList;
  }

  calcTotal(data) {
    let total = 0;
    for (let item in data) {
      total = total + data[item]
    }
    console.log(total)
    return total;
  }

  calcListTotal(data) {
    let total = 0;
    data.map(item => {
      total = total + item.value
    })
    return total;
  }

  calcPercent(total, value) {
    return (value * 100) / total;
  }

  mountEpiChart(data) {
    let chartData = [];
    for (let type in data) {
      chartData.push({ name: this.calcPercent(this.calcTotal(data), data[type]).toFixed(2) + '%', y: data[type], z: type });
    }
    this.epiChart = new Chart({
      chart: {
        type: 'pie',
        height: 275,
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
        name: 'Probabilidade',
        data: chartData,
        type: undefined
      }]
    });
  }

  mountKnowChart(data) {
    let chartData = [];
    for (let type in data) {
      chartData.push({ name: this.calcPercent(this.calcTotal(data), data[type]).toFixed(2) + '%', y: data[type], z: type });
    }
    this.knowChart = new Chart({
      chart: {
        type: 'pie',
        height: 275,
      },
      title: {
          text: ''
      },
      credits: {
        enabled: false
      },
      colors: ['#f8e71c', '#9013fe', '#f59600', '#548595'],
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
        name: 'Probabilidade',
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
