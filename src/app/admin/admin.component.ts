import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { LoginService } from '../login.service';
import { NotificationService } from '../notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../storage.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  userEmail;
  userName;
  userType;
  orgList;
  page;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public _auth: LoginService,
    public _storage: StorageService,
    public _app: AppService,
    public notification: NotificationService
  ) { }

  ngOnInit() {
    this.verifyUser();
    this.userName = this._storage.getData('UserData').userName;
    this.userType = this._storage.getData('UserData').userAccessProfile.toLowerCase();
    this._app.getOrgUnits().subscribe(
      response => {
        this.orgList = response;
        this._storage.setData('orgList', this.orgList);
      },
      error => {
        console.log(error);
        if (error.status === 401) {
          this.router.navigate(['login']);
        }
      }
    );
    this.page = this.router.url.replace('/admin/home', '');
    this.router.navigate(['/admin/home']);
  }

  verifyUser() {
    if (!this._storage.getData('LoggedUser')) {
      this.router.navigate(['login'])
      this.notification.error('Para acessar é necessário que faça o login novamente.')
    } 
  }

}
