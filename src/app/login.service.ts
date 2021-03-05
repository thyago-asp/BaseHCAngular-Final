import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SERVER_API_URL } from 'src/environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private http: HttpClient,
    private _storage: StorageService
  ) { }

  login(userEmail, userPassword): Observable<any> {
    const data = { userEmail, userPassword, channel: 'ADMIN' };
    console.log(data)
    return this.http.post(`${SERVER_API_URL}/auth/v1/authenticate`, data);
  }

  create(data) {
    return this.http.post(`${SERVER_API_URL}/user/v1/signup`, data);
  }

  getUser() {
    return this.http.get(`${SERVER_API_URL}/user/v1/detail`, { headers: this.authHeaders() });
  }

  sendResetEmail(email) {
    return this.http.put(`${SERVER_API_URL}/user/v1/reset-password/${email}`, {});
  }

  newPassword(data) {
    return this.http.put(`${SERVER_API_URL}/user/v1/new-password`, data);
  }

  validateToken(token) {
    return this.http.get(`${SERVER_API_URL}/auth/v1/validate/${token}`);
  }

  authHeaders() {
    const headers = new HttpHeaders({
      'Content-Type':'application/json; charset=utf-8',
      'Authorization': `Bearer ${this._storage.getData('LoggedUser').jwt}`
    });
    return headers;
  }

}
