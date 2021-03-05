import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from 'src/app/storage.service';
import { FilterService } from '../filter.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() username: string;
  @Input() orgList: [];
  @Input() userType: string;
  page;
  selected = 'todas as unidades';
  list = [];

  filterSub: Subscription;

  constructor(
    private router: Router,
    private _filter: FilterService,
    private route: ActivatedRoute,
    public _storage: StorageService
  ) {
    this.filterSub = this._filter.getFilter().subscribe(filter => {
      if (filter) {
        if (filter.filter.type === 'unit') {
          console.log(filter.filter);
          this.selected = filter.filter.name;
        }
      }
    });
  }

  ngOnInit() {
    this.selected = this._storage.getData('Filters').unitName;
  }

  sendFilter(filter, name) {
    this._filter.sendFilter({ type: 'unit', value: filter, name: name })
  }

  clearFilter() {
    this._filter.clearFilter();
  }

  logout() {
    this._storage.clear();
    this.router.navigate(['login']);
  }

  // getUserType(type) {
  //   return type.toLowerCase();
  // }

  ngOnDestroy() {
    this.filterSub.unsubscribe();
  }

}
