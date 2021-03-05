import { Component, OnInit, OnDestroy  } from '@angular/core';
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
  selector: 'app-risk',
  templateUrl: './risk.component.html',
  styleUrls: ['./risk.component.scss']
})
export class RiskComponent implements OnInit, OnDestroy  {
  indicators;
  comorbiditiesData;
  riskData;
  healthData;
  comorbiditiesLists = [];
  riskLists = [];
  healthLists = [];
  comorbiditiesChart: Chart;
  riskChart: Chart;
  healthChart: Chart;
  riskTypes = [
    { name: 'tabagismo', filter: 'smoke', value: 'Fumo diariamente' },
    { name: 'obesidade', filter: 'imcWarning', value: 'Obesidade' },
    { name: 'gestante', filter: 'pregnant', value:  'true' },
    { name: 'sobrepeso', filter: 'imcWarning', value: 'Sobrepeso' },
    { name: 'faixa etária', filter: 'userAgeGt', value: 65 }
  ];

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
      if (message.message && message.page === 'risk') {
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
    this.comorbiditiesLists = [];
    this.riskLists = [];
    this.healthLists = [];
    this.getIndicators(filters.unit);
    this.getComorbiditiesData(filters);
    this.getRiskData(filters);
    this.getHealthData(filters)
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

  getComorbiditiesData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getComorbiditiesData(filter).subscribe(
      response => {
        this.comorbiditiesData = response;
        this.mountComorbiditiesChart(this.comorbiditiesData.groupCountList);
        this.getComorbiditiesLists(filter)
        console.log(response)
      },
      error => {
        console.log(error);
      }
    );
  }

  getRiskData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getRiskData(filter).subscribe(
      response => {
        this.riskData = response;
        this.mountRiskChart(this.riskData.groupCountMap);
        this.getRiskLists(filter)
        console.log(response)
      },
      error => {
        console.log(error);
      }
    );
  }

  getHealthData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getHealthData(filter).subscribe(
      response => {
        this.healthData = response;
        this.mountHealthChart(this.healthData.groupCountMap);
        this.getHealthDataLists(filter)
        console.log(response)
      },
      error => {
        console.log(error);
      }
    );
  }

  getComorbiditiesLists(filter) {
    this.comorbiditiesData.groupCountList.map(item => {
      this._app.getWorkplaceList({ ...filter, comorbiditiesScore: [item.filter] }).subscribe(
        response => {
          this.comorbiditiesLists.push({...response, type: item, filter: { ...filter, comorbiditiesScore: [item.filter] }});
          console.log(response)
        },
        error => {
          console.log(error);
        }
      );
    })
  }

  getRiskLists(filter) {
    this.riskTypes.map(item => {
      this._app.getWorkplaceList({ ...filter, [item.filter]: item.value }).subscribe(
        response => {
          this.riskLists.push({...response, type: item.name, filter: { ...filter, [item.filter]: item.value }});
          console.log(response)
        },
        error => {
          console.log(error);
        }
      );
    })
  }

  getHealthDataLists(filter) {
    for (let type in this.healthData.groupCountMap) {
      this._app.getWorkplaceList({ ...filter, healthHistory: type }).subscribe(
        response => {
          this.healthLists.push({...response, type: type, filter: { ...filter, healthHistory: type }});
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

  mountComorbiditiesChart(data) {
    let chartData = [];
    data.map(item => {
      chartData.push({ name: this.calcPercent(this.calcListTotal(data), item.value).toFixed(2) + '%', y: item.value, z: item.label });
    })
    this.comorbiditiesChart = new Chart({
      chart: {
        type: 'pie',
        height: 270,
      },
      title: {
          text: ''
      },
      credits: {
        enabled: false
      },
      colors: ['#fd404b', '#e66e4a', '#e8a32e', '#17c6bc', '#168d86', '#3fa9e8', '#1b587b'],
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

  mountRiskChart(data) {
    let chartData = [];
    console.log(data);
    for (let type in data) {
      chartData.push({ name: type, y: data[type] });
    }
    this.riskChart = new Chart(
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
        colors: ['#907b38', '#635115', '#b8910f', '#a4976c', '#d4c596', '#edcc60', '#e0b426', '#eabd2b', '#c4b484', '#beb495', '#9c998d'],
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
                name: "Risco",
                colorByPoint: true,
                type: undefined,
                data: chartData
            }
        ]
    }
    );
  }

  mountHealthChart(data) {
    let chartData = [];
    console.log(data);
    for (let type in data) {
      chartData.push({ name: type, y: data[type] });
    }
    this.healthChart = new Chart(
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
        colors: ['#cc6398', '#c34893', '#c62b74', '#b7296d', '#99296a', '#fc6375', '#e65c71', '#e65f56', '#e66e4a', '#fd8e38', '#e8a32e', '#e87a00'],
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
                name: "Risco",
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
