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
  selector: 'app-behavior',
  templateUrl: './behavior.component.html',
  styleUrls: ['./behavior.component.scss']
})
export class BehaviorComponent implements OnInit, OnDestroy {
  indicators;

  charData;
  charChart: Chart;
  charLists = [];

  careData;
  careChart: Chart;
  careLists = [];

  outData;
  outChart: Chart;
  outLists = [];

  distData;
  distChart: Chart;
  distLists = [];

  transData;
  transChart: Chart;
  transLists = [];

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
      if (message.message && message.page === 'behavior') {
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
    this.charLists = [];
    this.careLists = [];
    this.outLists = [];
    this.distLists = [];
    this.transLists = [];
    this.getIndicators(filters.unit);
    //this.getCharData(filters);
  //  this.getCareData(filters);
  //  this.getOutData(filters);
  //  this.getDistData(filters);
  //  this.getTransData(filters);
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

  getCharData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getCharData(filter).subscribe(
      response => {
        this.charData = response;
        this.mountCharChart(this.charData.groupCountMap);
        this.getCharLists(filter);
        console.log(this.charData)
      },
      error => {
        console.log(error);
      }
    );
  }

  getCareData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getCareData(filter).subscribe(
      response => {
        this.careData = response;
        this.mountCareChart(this.careData.groupCountMap);
        this.getCareLists(filter);
        console.log(this.careData)
      },
      error => {
        console.log(error);
      }
    );
  }

  getOutData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getOutData(filter).subscribe(
      response => {
        this.outData = response;
        this.mountOutChart(this.outData.groupCountMap);
        this.getOutLists(filter);
        console.log(this.outData)
      },
      error => {
        console.log(error);
      }
    );
  }

  getDistData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getDistData(filter).subscribe(
      response => {
        this.distData = response;
        this.mountDistChart(this.distData.groupCountMap);
        this.getDistLists(filter);
        console.log(this.distData)
      },
      error => {
        console.log(error);
      }
    );
  }

  getCharLists(filter) {
    for (let result in this.charData.groupCountMap) {
      let query = {
        ['moram com idosos']: { filter: 'liveWithYears60', value: true },
        ['moram com menores de 18 anos']: { filter: 'liveWithYears18', value: true },
        ['moram sozinhos']: { filter: 'yourHome', value: 'true' }
      }
      this._app.getWorkplaceList({ ...filter, [query[result].filter]: query[result].value }).subscribe(
        response => {
          this.charLists.push({...response, type: result, filter: { ...filter, [query[result].filter]: query[result].value }});
          console.log(response)
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  getCareLists(filter) {
    for (let result in this.careData.groupCountMap) {
      this._app.getWorkplaceList({ ...filter, protectPartners: result }).subscribe(
        response => {
          this.careLists.push({...response, type: result, filter: { ...filter, protectPartners: result }});
          console.log(response)
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  getOutLists(filter) {
    for (let result in this.outData.groupCountMap) {
      this._app.getWorkplaceList({ ...filter, outOfHome: result }).subscribe(
        response => {
          this.outLists.push({...response, type: result, filter: { ...filter, outOfHome: result }});
          console.log(response)
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  getDistLists(filter) {
    for (let result in this.distData.groupCountMap) {
      this._app.getWorkplaceList({ ...filter, distance: result }).subscribe(
        response => {
          this.distLists.push({...response, type: result, filter: { ...filter, distance: result }});
          console.log(response)
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  getTransData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getTransData(filter).subscribe(
      response => {
        this.transData = response;
        this.mountTransChart(this.transData.groupCountMap);
        this.getTransLists(filter);
        console.log(this.transData)
      },
      error => {
        console.log(error);
      }
    );
  }

  getTransLists(filter) {
    for (let result in this.transData.groupCountMap) {
      this._app.getWorkplaceList({ ...filter, transportType: result }).subscribe(
        response => {
          this.transLists.push({...response, type: result, filter: { ...filter, transportType: result }});
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

  mountCharChart(data) {
    let chartData = [];
    for (let type in data) {
      chartData.push({ name: this.calcPercent(this.calcTotal(data), data[type]).toFixed(2) + '%', y: data[type], z: type });
    }
    this.charChart = new Chart({
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
      colors: ['#e66e4a', '#17c6bc', '#8b572a'],
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

  mountCareChart(data) {
    let chartData = [];
    for (let type in data) {
      chartData.push({ name: this.calcPercent(this.calcTotal(data), data[type]).toFixed(2) + '%', y: data[type], z: type === 'true' ? 'sim' : 'não' });
    }
    this.careChart = new Chart({
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
        name: 'Probabilidade',
        data: chartData,
        type: undefined
      }]
    });
  }

  mountOutChart(data) {
    let chartData = [];
    for (let type in data) {
      chartData.push({ name: this.calcPercent(this.calcTotal(data), data[type]).toFixed(2) + '%', y: data[type], z: type === 'true' ? 'sim' : 'não' });
    }
    this.outChart = new Chart({
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
      colors: ['#1f9d96', '#28f0e4'],
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

  mountDistChart(data) {
    let chartData = [];
    for (let type in data) {
      chartData.push({ name: this.calcPercent(this.calcTotal(data), data[type]).toFixed(2) + '%', y: data[type], z: type === 'true' ? 'sim' : 'não' });
    }
    this.distChart = new Chart({
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
      colors: ['#ab6638', '#f5a623'],
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

  mountTransChart(data) {
    let chartData = [];
    console.log(data);
    for (let type in data) {
      chartData.push({ name: type, y: data[type] });
    }
    this.transChart = new Chart(
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
        colors: ['#9fb3db', '#8293db', '#7686db', '#526ddc', '#207dea', '#4193ea', '#4fa6ea'],
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
                name: "Transporte",
                colorByPoint: true,
                type: undefined,
                data: chartData
            }
        ]
    }
    );
  }

  verifyObj(obj) {
    return Object.keys(obj).length !== 0 && obj.constructor === Object;
  }

  ngOnDestroy() {
    this.filterSub.unsubscribe();
    this.messageSub.unsubscribe();
  }

}
