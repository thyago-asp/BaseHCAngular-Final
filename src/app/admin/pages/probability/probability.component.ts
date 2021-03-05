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
  selector: 'app-probability',
  templateUrl: './probability.component.html',
  styleUrls: ['./probability.component.scss']
})
export class ProbabilityComponent implements OnInit, OnDestroy {
  indicators;
  probData;
  sympData;
  criticalData;
  probLists = [];
  sympLists = [];
  criticalLists = [];
  probChart: Chart;
  sympChart: Chart;
  criticalChart: Chart;

  filterSub: Subscription;
  filters;

  period;

  messageSub: Subscription

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
      if (message.message && message.page === 'probability') {
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
    this.probLists = [];
    this.sympLists = [];
    this.criticalLists = [];
    this.getIndicators(filters.unit);
    this.getProbData(filters);
    this.getCriticalData(filters);
    this.getSympData(filters);
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

  getProbData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getProbabilityData(filter).subscribe(
      response => {
        this.probData = response;
        this.mountProbChart(this.probData.groupCountList);
        this.getProbLists(filter)
        console.log(this.probData)
      },
      error => {
        console.log(error);
      }
    );
  }

  getCriticalData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getCriticalData(filter).subscribe(
      response => {
        this.criticalData = response;
        this.mountCriticalChart(this.criticalData.groupCountMap);
        this.getCriticalLists(filter)
        console.log(this.criticalData)
      },
      error => {
        console.log(error);
      }
    );
  }

  getSympData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getSymptomsData(filter).subscribe(
      response => {
        this.sympData = response;
        this.mountSympChart(this.sympData.groupCountList);
        this.getSympLists(filter)
        console.log(response)
      },
      error => {
        console.log(error);
      }
    );
  }

  getProbLists(filter) {
    this.probData.groupCountList.map(item => {
      this._app.getWorkplaceList({ ...filter, results: [item.filter] }).subscribe(
        response => {
          this.probLists.push({...response, type: item.label, filter: { ...filter, results: [item.filter] }});
          console.log(response)
        },
        error => {
          console.log(error);
        }
      );
    })
  }

  getCriticalLists(filter) {
    for (let result in this.criticalData.groupCountMap) {
      this._app.getWorkplaceList({ ...filter, symptomsCritical: result }).subscribe(
        response => {
          this.criticalLists.push({...response, type: result, filter: { ...filter, symptomsCritical: result }});
          console.log(response)
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  getSympLists(filter) {
    this.sympData.groupCountList.map(item => {
      this._app.getWorkplaceList({ ...filter, [item.filter]: item.label }).subscribe(
        response => {
          this.sympLists.push({...response, type: item.label, filter: { ...filter, [item.filter]: item.label }});
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

  mountProbChart(data) {
    let chartData = [];
    data.map(item => {
      chartData.push({ name: this.calcPercent(this.calcListTotal(data), item.value).toFixed(2) + '%', y: item.value, z: item.label });
    })
    this.probChart = new Chart({
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
      colors: ['#fd404b', '#f8e71c', '#f59600', '#17c6bc', '#168d86', '#3fa9e8', '#1b587b'],
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

  mountCriticalChart(data) {
    let chartData = [];
    for (let type in data) {
      chartData.push({ name: `${this.calcPercent(this.calcTotal(data), data[type]).toFixed(2)}%`, y: data[type], z: type === 'true' ? 'sim' : 'não' });
    }
    this.criticalChart = new Chart({
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
        name: 'aumento rápido dos sintomas',
        data: chartData,
        type: undefined
      }]
    });
  }

  mountSympChart(data) {
    let chartData = [];
    console.log(data);
    data.map(item => {
      chartData.push({ name: item.label, y: item.value });
    })
    this.sympChart = new Chart(
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
        colors: ['#644c01', '#735b0d', '#a18118', '#c09c27', '#c9ae56', '#edcc60', '#e0b426', '#eabd2b', '#c4b484', '#beb495', '#9c998d'],
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
                name: "Sintoma",
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
