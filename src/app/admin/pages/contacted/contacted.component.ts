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
  selector: 'app-contacted',
  templateUrl: './contacted.component.html',
  styleUrls: ['./contacted.component.scss']
})
export class ContactedComponent implements OnInit, OnDestroy {
  indicators;
  contactData;
  partnersData;
  contactLists = [];
  partnersLists = [];
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
      if (message.message && message.page === 'contacted') {
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
    this.contactLists = [];
    this.partnersLists = [];
    this.getIndicators(filters.unit);
    this.getContactData(filters);
    this.getPartnersData(filters);
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

  getContactData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getContactData(filter).subscribe(
      response => {
        this.contactData = response;
        this.mountBarChart(this.contactData.groupCountMap);
        this.getContactLists(filter)
        console.log(response)
      },
      error => {
        console.log(error);
      }
    );
  }

  getContactLists(filter) {
    for (let type in this.contactData.groupCountMap) {
      this._app.getWorkplaceList({ ...filter, contactWhere: type }).subscribe(
        response => {
          this.contactLists.push({...response, type: type, filter: { ...filter, contactWhere: type }});
          console.log(response)
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  getPartnersData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getPartnersData(filter).subscribe(
      response => {
        this.partnersData = response;
        this.mountChart(this.partnersData.groupCountMap);
        this.getPartnersLists(filter)
        console.log(response)
      },
      error => {
        console.log(error);
      }
    );
  }

  getPartnersLists(filter) {
    for (let type in this.partnersData.groupCountMap) {
      this._app.getWorkplaceList({ ...filter, protectPartners: type }).subscribe(
        response => {
          this.partnersLists.push({...response, type: type, filter: { ...filter, protectPartners: type }});
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
    for (let legend in this.partnersData.groupCountMap) {
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
        colors: ['#0d5069', '#194379', '#201f8e', '#752fb2', '#8836cf', '#9b3af0', '#ad59f6', '#dd7bf6'],
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
                name: "Tipos de contato",
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
      chartData.push({ name: this.calcPercent(this.calcTotal(data), data[result]).toFixed(2) + '%', y: data[result], z: result === 'true' ? 'sim' : 'não' });
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
      colors: ['#388dab', '#11b7f1'],
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
        name: 'Pessoas do convívio',
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
