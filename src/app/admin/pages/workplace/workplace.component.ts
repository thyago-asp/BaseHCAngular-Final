import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { LoginService } from 'src/app/login.service';
import { NotificationService } from 'src/app/notification.service';
import { StorageService } from 'src/app/storage.service';
import { Chart, MapChart } from 'angular-highcharts';
import * as moment from 'moment';
import Highcharts from "highcharts/highmaps";
import { Options } from "highcharts";
import brazil from '@highcharts/map-collection/countries/br/br-all.geo.json';
import { PERIOD_TYPES}  from './../../periods.const';
import { Subscription } from 'rxjs';
import { FilterService } from '../../filter.service';
import { ModalService } from '../../modal.service';

@Component({
  selector: 'app-workplace',
  templateUrl: './workplace.component.html',
  styleUrls: ['./workplace.component.scss']
})
export class WorkplaceComponent implements OnInit, OnDestroy {
  indicators;
  stateData;
  workplaceData;
  workplaceLists = [];
  stateLists = [];
  mapChart: MapChart;
  chart: Chart;
  ufList = {
    sp: 'br-sp',
    ma: 'br-ma',
    pa: 'br-pa',
    sc: 'br-sc',
    ba: 'br-ba',
    ap: 'br-ap',
    ms: 'br-ms',
    mg: 'br-mg',
    go: 'br-go',
    rs: 'br-rs',
    to: 'br-to',
    pi: 'br-pi',
    al: 'br-al',
    pb: 'br-pb',
    ce: 'br-ce',
    se: 'br-se',
    rr: 'br-rr',
    pe: 'br-pe',
    pr: 'br-pr',
    es: 'br-es',
    rj: 'br-rj',
    rn: 'br-rn',
    am: 'br-am',
    mt: 'br-mt',
    df: 'br-df',
    ac: 'br-ac',
    ro: 'br-ro',
  }

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
      if (message.message && message.page === 'workplace') {
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
    this.workplaceLists = [];
    this.stateLists = [];
    this.getIndicators(filters.unit);
    this.getStateData(filters);
    this.getWorkplaceData(filters);
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

  getStateData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getStateData(filter).subscribe(
      response => {
        this.stateData = response;
        this.mountMap(this.stateData.groupCountMap);
        this.getStateLists(filter);
        console.log(response)
      },
      error => {
        console.log(error);
      }
    );
  }

  getWorkplaceData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getWorkplaceData(filter).subscribe(
      response => {
        this.workplaceData = response;
        this.mountWorkplaceChart(this.workplaceData.groupCountMap);
        this.gerWorkplaceLists(filter);
        console.log(response)
      },
      error => {
        console.log(error);
      }
    );
  }

  gerWorkplaceLists(filter) {
    for (let workplace in this.workplaceData.groupCountMap) {
      this._app.getWorkplaceList({ ...filter, workplace: workplace }).subscribe(
        response => {
          this.workplaceLists.push({...response, place: workplace, filter: { ...filter, workplace: workplace }});
          console.log(response)
        },
        error => {
          console.log(error);
        }
      );
    } 
  }

  getStateLists(filter) {
    for (let uf in this.stateData.groupCountMap) {
      this._app.getWorkplaceList({ ...filter, userStateUf: uf }).subscribe(
        response => {
          this.stateLists.push({...response, state: uf, filter: { ...filter, userStateUf: uf }});
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
    for (let legend in this.workplaceData.groupCountMap) {
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

  mountMap(data) {
    let mapData = [];
    for (let uf in this.ufList) {
      let isValid = true;
      for (let item in data) {
        if (item.toLocaleLowerCase() === uf) {
          isValid = false
        }
      }
      if (isValid) {
        mapData.push([this.ufList[uf], 0]);
      }
    }
    for (let uf in data) {
      mapData = [...mapData, [this.ufList[uf.toLocaleLowerCase()], data[uf]]];
    }
    this.mapChart = new MapChart({
      chart: {
          map: brazil,
          backgroundColor: '#FFFFFF',
          borderColor: '#FFFFFF',
          borderWidth: 0.3
      },
      credits: {
        enabled: false
      },
      title: {
          text: ''
      },
      subtitle: {
          text: ''
      },
      mapNavigation: {
          enabled: false,
          enableButtons: false,
          buttonOptions: {
              verticalAlign: 'bottom'
          }
      },
      plotOptions: {
        map: {
          color: '#60dce6'
        }
      },
      colorAxis: {
        min: 0,
        minColor: '#FFFFFF',
        maxColor: '#0f838c'
      },
      series: [{
          data: mapData,
          name: 'Colaboradores',
          dataLabels: {
              enabled: true,
              format: '{point.properties.hc-a2}'
          },
          type: undefined
      }]
    });
  }

  mountWorkplaceChart(data) {
    let chartData = [];
    for (let workplace in data) {
      chartData.push({ name: this.calcPercent(this.calcTotal(data), data[workplace]).toFixed(2) + '%', y: data[workplace], z: workplace });
    }
    this.chart = new Chart({
      chart: {
        type: 'pie',
        height: 250,
      },
      title: {
          text: ''
      },
      credits: {
        enabled: false
      },
      colors: ['#e66e4a', '#17c6bc', '#e8a32e'],
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
