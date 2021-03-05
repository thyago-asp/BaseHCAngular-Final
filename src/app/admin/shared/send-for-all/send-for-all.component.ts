import { Component, OnInit, Input } from '@angular/core';
import { ModalService } from '../../modal.service';

@Component({
  selector: 'app-send-for-all',
  templateUrl: './send-for-all.component.html',
  styleUrls: ['./send-for-all.component.scss']
})
export class SendForAllComponent implements OnInit {
  @Input() page: string;
  @Input() type: string;
  @Input() list: any;
  @Input() filter: any;

  constructor(
    private _msgModal: ModalService
  ) { }

  ngOnInit() {
  }

  openModal() {
    this._msgModal.open(this.page, this.type, this.list, this.filter);
  }

}
