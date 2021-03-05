import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private subject = new Subject<any>();

  constructor() { }

  sendFilter(filterObj) {
      this.subject.next({ filter: filterObj });
  }

  clearFilter() {
      this.subject.next();
  }

  getFilter(): Observable<any> {
      return this.subject.asObservable();
  }
}
