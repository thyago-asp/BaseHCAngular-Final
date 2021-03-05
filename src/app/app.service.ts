import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SERVER_API_URL } from 'src/environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(
    private http: HttpClient,
    private _storage: StorageService
  ) { }

  getOrgUnits() {
    return this.http.get(`${SERVER_API_URL}/organization-unit/v1`, { headers: this.authHeaders() });
  }

  getIndicators(unit?) {
    return this.http.get(`${SERVER_API_URL}/formprocessor/v1/indicators${unit ? '?idOrgUnit=' + unit : ''}`, { headers: this.authHeaders() });
  }

  getEmployeesByType(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=userEmployeeType`, filter, { headers: this.authHeaders() });
  }

  getEmployeesList(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search?pageNo=0&pageSize=100&sortBy=savedAt&sortDir=DESC`, filter, { headers: this.authHeaders() });
  }

  getGenderData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=userGender`, filter, { headers: this.authHeaders() });
  }

  getGenderList(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search?pageNo=0&pageSize=100&sortBy=savedAt&sortDir=DESC`, filter, { headers: this.authHeaders() });
  }

  getUserAgeData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=userAge`, filter, { headers: this.authHeaders() });
  }

  getStateData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=userStateUf`, filter, { headers: this.authHeaders() });
  }

  getWorkplaceData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=workplace`, filter, { headers: this.authHeaders() });
  }

  getWorkplaceList(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search?pageNo=0&pageSize=100&sortBy=savedAt&sortDir=DESC`, filter, { headers: this.authHeaders() });
  }

  getTestTypeData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=testType`, filter, { headers: this.authHeaders() });
  }

  getTestResultData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=test`, filter, { headers: this.authHeaders() });
  }

  getProbabilityData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=result`, filter, { headers: this.authHeaders() });
  }

  getCriticalData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=symptomsCritical`, filter, { headers: this.authHeaders() });
  }

  getSymptomsData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=principalSymptoms`, filter, { headers: this.authHeaders() });
  }

  getContactData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=contactWhere`, filter, { headers: this.authHeaders() });
  }

  getPartnersData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=protectPartners`, filter, { headers: this.authHeaders() });
  }

  getComorbiditiesData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=comorbiditiesScore`, filter, { headers: this.authHeaders() });
  }

  getRiskData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=riskFactor`, filter, { headers: this.authHeaders() });
  }

  getHealthData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=healthHistory`, filter, { headers: this.authHeaders() });
  }

  getOtherSympData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=symptomsOthers`, filter, { headers: this.authHeaders() });
  }

  getEpiData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=products`, filter, { headers: this.authHeaders() });
  }

  getKnowData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=protect`, filter, { headers: this.authHeaders() });
  }

  getCharData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=liveWith`, filter, { headers: this.authHeaders() });
  }

  getCareData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=protectPartners`, filter, { headers: this.authHeaders() });
  }

  getOutData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=outOfHome`, filter, { headers: this.authHeaders() });
  }

  getDistData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=distance`, filter, { headers: this.authHeaders() });
  }

  getTransData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=transportType`, filter, { headers: this.authHeaders() });
  }

  getInfectedData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=resultInfectedPeriod`, filter, { headers: this.authHeaders() });
  }

  getEngageData(filter) {
    return this.http.post(`${SERVER_API_URL}/userformprocessor/v1/search-group?groupBy=employeeEngagement`, filter, { headers: this.authHeaders() });
  }

  getLineData(filter, unit) {
    return this.http.get(`${SERVER_API_URL}/admin/v1/dashboard/line-chart?period=${filter}${unit === '0' ? '' : '&orgUnit=' + unit}`, { headers: this.authHeaders() });
  }

  sendMessage(filter) {
    return this.http.post(`${SERVER_API_URL}/admin/v1/send-message`, filter, { headers: this.authHeaders() });
  }

  authHeaders() {
    const headers = new HttpHeaders({
      'Content-Type':'application/json; charset=utf-8',
      'Authorization': `Bearer ${this._storage.getData('LoggedUser').jwt}`
    });
    return headers;
  }
}
