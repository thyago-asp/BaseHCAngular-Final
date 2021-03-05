import { Component, OnInit, OnDestroy } from '@angular/core';
import { FilterService } from '../../filter.service';
import { Subscription } from 'rxjs';
import { StorageService } from 'src/app/storage.service';

@Component({
  selector: 'app-period-select',
  templateUrl: './period-select.component.html',
  styleUrls: ['./period-select.component.scss']
})
export class PeriodSelectComponent implements OnInit, OnDestroy {
  filterSub: Subscription;
  selected = '7d';

  constructor(
    private _filter: FilterService,
    public _storage: StorageService
  ) {
    this.filterSub = this._filter.getFilter().subscribe(filter => {
      if (filter) {
        if (filter.filter.type === 'period') {
          this.selected = filter.filter.value;
          console.log(filter);
        }
      }
    });
  }

  ngOnInit() {
    this.selected = this._storage.getData('Filters').period;
  }

  sendFilter(filter) {
    this._filter.sendFilter({ type: 'period', value: filter, name: null })
  }

  clearFilter() {
    this._filter.clearFilter();
  }

  ngOnDestroy() {
    this.filterSub.unsubscribe();
  }

}
