import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private subject = new Subject<any>();

  constructor() {}

  open(page, type, list?, filter?, id?) {
    this.subject.next({ page, type, list, filter, id });
    document.getElementById('msg-modal').style.display = "block";
  }

  close() {
    document.getElementById('msg-modal').style.display = "none";
  }

  sendMessage(page, message, type, list?, filter?, id?) {
    this.subject.next({ page, message, type, list, filter, id });
  }

  clearMessage() {
      this.subject.next();
  }

  getMessage(): Observable<any> {
      return this.subject.asObservable();
  }
}
