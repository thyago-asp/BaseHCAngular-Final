import { Component, OnInit, Input } from '@angular/core';
import { ModalService } from '../../modal.service';

@Component({
  selector: 'app-drop-list',
  templateUrl: './drop-list.component.html',
  styleUrls: ['./drop-list.component.scss']
})
export class DropListComponent implements OnInit {
  @Input() title: string;
  @Input() unit: string;
  @Input() employees: [];
  @Input() page: string;
  @Input() type: string;
  @Input() list: any;
  @Input() filter: any;
  dropListActive = false;

  constructor(private _msgModal: ModalService) { }

  ngOnInit() {
    console.log(this.employees, this.list, this.filter);
  }

  toggle() {
    if (this.dropListActive) {
      this.dropListActive = false;
    } else {
      this.dropListActive = true;
    }
  }

  openModal(id) {
    this._msgModal.open(this.page, 'personal', this.list, this.filter, id);
  }

}
