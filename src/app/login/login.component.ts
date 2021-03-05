import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { StorageService } from '../storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username;
  password;
  alert;

  constructor(
    private router: Router,
    public _auth: LoginService,
    public _storage: StorageService
  ) {
    this.alert = Swal;
  }

  ngOnInit() {
    this._storage.clear();
  }

  login() {
    this._auth.login(this.username, this.password).subscribe(
      response => {
        this._storage.setData('LoggedUser', response)
        this._auth.getUser().subscribe(
          response => {
            this._storage.setData('UserData', response);
            this._storage.setData('Filters', { unit: 0, period: '7d', unitName: 'todas as unidades' })
            this.router.navigate(['admin']);
          },
          error => {
            console.log('Erro: ', error);
            if (error.status === 401) {
              this.router.navigate(['login']);
            }
          }
        );
      },
      error => {
        console.log('ERRO: ', error);
      }
    );
  }

  togglePassView(id) {
    const input = (<HTMLInputElement>document.getElementById(id));
    input.type = input.type === 'text' ? 'password' : 'text';
  }

  navigate(route) {
    this.router.navigate([route]);
  }

}
