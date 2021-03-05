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
  selector: 'app-needed',
  templateUrl: './needed.component.html',
  styleUrls: ['./needed.component.scss']
})
export class NeededComponent implements OnInit, OnDestroy {
  indicators;
  infectedList;

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
      if (message.message && message.page === 'needed') {
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
    this.gerInfectedList(filters);
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

  gerInfectedList(filters) {
    const unit = filters.unit === 0 ? null : filters.unit;
    const filter = { ...this.period[filters.period].filter, idOrgUnit: unit }
    const infectedFilter = [ 
      "TYPE_01_SymptomaticHighSuspicionOfCovid19", 
      "TYPE_02_SymptomaticLowerSuspicionOfCovid19", 
      "TYPE_03_AsymptomaticLowerSuspicion", 
      "TYPE_04_AsymptomaticHighSuspicion", 
      "TYPE_05_SymptomaticLowerSuspicion" 
    ];
    this.filterList = { ...filter, test: 'Não realizei nenhum teste', results: infectedFilter };
    this.type = infectedFilter;
    this._app.getGenderList({ ...filter, test: 'Não realizei nenhum teste', results: infectedFilter }).subscribe(
      res => {
        this.infectedList = res;
        console.log(this.infectedList);
        console.log(res);
      },
      err => {
        console.log(err);
      }
    );
  }

  ngOnDestroy() {
    this.filterSub.unsubscribe();
    this.messageSub.unsubscribe();
  }

}
