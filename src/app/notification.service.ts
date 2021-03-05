import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  alert;

  constructor() {
    this.alert = Swal;
  }

  error(message: string) {
    this.alert.fire({
      title: 'Erro!',
      text: message,
      type: 'error',
      confirmButtonText: 'OK'
    })
  }

  success(message: string) {
    this.alert.fire({
      title: 'Sucesso!',
      text: message,
      type: 'success',
      confirmButtonText: 'OK'
    })
  }
}
