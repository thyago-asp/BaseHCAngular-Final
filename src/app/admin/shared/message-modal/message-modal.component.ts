import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalService } from '../../modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-message-modal',
  templateUrl: './message-modal.component.html',
  styleUrls: ['./message-modal.component.scss']
})
export class MessageModalComponent implements OnInit, OnDestroy {
  message;
  messageSub: Subscription;

  page;
  type;
  list;
  filter;
  id;

  title;

  constructor(
    private _msgModal: ModalService
  ) {
    this.messageSub = this._msgModal.getMessage().subscribe(message => {
      if (!message.message) {
        this.page = message.page;
        this.type = message.type;
        this.list = message.list;
        this.filter = message.filter;
        this.id = message.id;
        if (message.type === 'all') {
          this.title = 'Escreva uma mensagem para todos os colaboradores';
        } else if (message.type === 'all-list') {
          this.title = 'Escreva uma mensagem para todos os colaboradores da lista';
        } else {
          this.title = 'Escreva uma mensagem para o colaborador';
        }
        console.log(message)
      }
    })
  }

  ngOnInit() {
  }

  send() {
    this._msgModal.sendMessage(this.page, this.message, this.type, this.list, this.filter, this.id);
    this.message = '';
    this._msgModal.close();
  }

  closeModal() {
    this.message = '';
    this._msgModal.close();
  }

  ngOnDestroy() {
    this.messageSub.unsubscribe();
  }

}
