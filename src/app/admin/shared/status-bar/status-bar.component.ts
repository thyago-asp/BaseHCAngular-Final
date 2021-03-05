import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss']
})
export class StatusBarComponent implements OnInit {
  @Input() indicators: {};
  @Output() updateEvent = new EventEmitter<any>();

  navigator;
  view;

  constructor() { }

  ngOnInit() {
    this.navigator = document.getElementById('navigator');
    this.view = document.getElementById('admin-view');
  }

  update() {
    this.updateEvent.emit(true);
  }

  toggleNav() {
    if (!this.navigator.classList.contains('hide')) {
      this.navigator.classList.add('hide');
      this.view.classList.add('hide');
    } else {
      this.view.classList.remove('hide');
      this.navigator.classList.remove('hide');
    }
  }

  formatNumbers(number) {
    return number.toString().replace(/\d(?=(?:\d{3})+$)/g, '$&.');
  }

}
