import { Component, OnInit, OnDestroy } from '@angular/core';
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
  selector: 'app-gender',
  templateUrl: './gender.component.html',
  styleUrls: ['./gender.component.scss']
})
export class GenderComponent implements OnInit, OnDestroy {
  indicators;
  genderData;
  genderNames;
  genderList = [];
  ageData;
  ageList = [];
  charts: any[] = [];

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
      if (message.message && message.page === 'gender') {
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
    this.genderList = [];
    this.charts = [];
    this.getIndicators(filters.unit);
    this.getGenderData(filters);
    this.getAgeData(filters);
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

  getGenderData(filters?) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    this._app.getGenderData(filter).subscribe(
      response => {
        this.genderData = response;
        console.log(this.genderData)
        this.genderNames = Object.keys(this.genderData.groupCountMap);
        this.genderNames.map(gender => {
          this.getGenderList(gender, filter);
        })
      },
      error => {
        console.log(error);
      }
    );
  }

  getGenderList(gender, filter) {
    this._app.getGenderList({ ...filter, userGender: gender }).subscribe(
      res => {
        this.genderList.push({ ...res, genderType: gender, filter: { ...filter, userGender: gender } });
        console.log(this.genderList);
        console.log(res);
      },
      err => {
        console.log(err);
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
    return Math.round((this.ageData.groupCountMap[age] * 100) / this.calcAgeTotal());
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
    this.messageSub.unsubscribe();
  }

}
