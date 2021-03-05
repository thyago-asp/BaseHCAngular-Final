import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { LoginService } from 'src/app/login.service';
import { NotificationService } from 'src/app/notification.service';
import { StorageService } from 'src/app/storage.service';
import { Chart, MapChart } from 'angular-highcharts';
import * as moment from 'moment';
import { PERIOD_TYPES}  from './../../periods.const';
import { Observable, Subscription } from 'rxjs';
import { FilterService } from '../../filter.service';
import { ModalService } from '../../modal.service';


@Component({
  selector: 'app-infected',
  templateUrl: './infected.component.html',
  styleUrls: ['./infected.component.scss']
})
export class InfectedComponent implements OnInit, OnDestroy {
  indicators;
  infectedData;
  infectedChart: Chart;
  infectedList = [];

  filterSub: Subscription;
  filters;

  period;

  messageSub: Subscription;

  type;
  filterList;

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
      if (message.message && message.page === 'infected') {
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
    this.getIndicators(filters.unit);
    this.getInfectedData(filters);
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

  getInfectedData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { idOrgUnit: unit }
    this._app.getInfectedData(filter).subscribe(
      response => {
        this.infectedData = response;
        this.mountInfectedChart(this.infectedData.groupCountList);
        this.getInfectedList(filter)
        console.log(this.infectedData)
      },
      error => {
        console.log(error);
      }
    );
  }

  getInfectedList(filter) {
    this.infectedData.groupCountList.map((item, index) => {
      let filters = {};
      if(item.filterDateDiagnosticOver) {
        filters['dateDiagnosticOver'] = item.filterDateDiagnosticOver;
      } else {
        filters['dateDiagnosticFrom'] = item.filterDateDiagnosticFrom;
        filters['dateDiagnosticTo'] = item.filterDateDiagnosticTo
      }
      this._app.getWorkplaceList({ ...filter, ...filters, test: item.filter }).subscribe(
        response => {
          this.infectedList[index] = {...response, type: item.label, filter: { ...filter, ...filters, test: item.filter }};
          console.log(response)
        },
        error => {
          console.log(error);
        }
      );
    })
  }

  createLegend(data) {
    let legendList = [];
    for (let legend in data.groupCountMap) {
      legendList.push(legend);
    }
    return legendList;
  }

  createListLegend(data) {
    let legendList = [];
    data.groupCountList.map(item => {
      legendList.push(item.label);
    })
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

  mountInfectedChart(data) {
    let chartData = [];
    data.map(type => {
      chartData.push({ name: this.calcPercent(this.calcListTotal(data), type.value).toFixed(2) + '%', y: type.value, z: type.label });
    })
    this.infectedChart = new Chart({
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
      colors: ['#fd404b', '#f39600', '#f8e71c', '#7ed321'],
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
