import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { LoginService } from 'src/app/login.service';
import { NotificationService } from 'src/app/notification.service';
import { StorageService } from 'src/app/storage.service';
import { Chart } from 'angular-highcharts';
import * as moment from 'moment';
import { PERIOD_TYPES}  from './../../periods.const';
import { Subscription } from 'rxjs';
import { FilterService } from '../../filter.service';
import { ModalService } from '../../modal.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {
  indicators;
  chart: Chart;
  employees;
  employeesLists = [];

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
      if (message.message && message.page === 'list') {
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

  update() {
    this.setData(this.filters);
  }

  setData(filters?) {
    this.employeesLists = [];
    this.getIndicators(filters.unit);
    this.getEmployeesByType(filters);
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

  getEmployeesByType(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getEmployeesByType(filter).subscribe(
      response => {
        this.employees = response;
        this.mountEmployeeChart(this.employees.groupCountMap);
        this.getEmployeesList(filter);
        console.log(response)
      },
      error => {
        console.log(error);
      }
    );
  }

  getEmployeesList(filter) {
    for (let result in this.employees.groupCountMap) {
      this._app.getEmployeesList({ ...filter, userEmployeeType: result }).subscribe(
        response => {
          this.employeesLists.push({...response, type: result, filter: { ...filter, userEmployeeType: result }});
          console.log(response)
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  mountEmployeeChart(data) {
    let chartData = [];
    for (let type in data) {
      chartData.push({ name: `${this.calcPercent(this.calcTotal(data), data[type]).toFixed(2)}%`, y: data[type], z: type });
    }
    console.log(data)
    console.log(chartData)
    this.chart = new Chart({
      chart: {
        height: 280,
        type: 'pie'
      },
      title: {
          text: ''
      },
      credits: {
        enabled: false
      },
      colors: ['#e66e4a', '#17c6bc'],
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
        name: 'colaboradores',
        data: chartData,
        type: undefined
      }]
    });
  }

  createLegend(data) {
    let legendList = [];
    for (let legend in data.groupCountMap) {
      legendList.push(legend);
    }
    return legendList;
  }

  calcPercent(total, value) {
    return (value * 100) / total;
  }

  calcTotal(data) {
    let total = 0;
    for (let item in data) {
      total = total + data[item]
    }
    console.log(total)
    return total;
  }

  verifyObj(obj) {
    return Object.keys(obj).length !== 0 && obj.constructor === Object;
  }

  ngOnDestroy() {
    this.filterSub.unsubscribe();
    this.messageSub.unsubscribe();
  }

}
