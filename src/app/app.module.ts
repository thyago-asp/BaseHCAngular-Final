import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginService } from './login.service';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { HttpClientModule } from '@angular/common/http';
import { InterceptorsModule } from './interceptors.module';
import { AppService } from './app.service';
import { ChartModule } from 'angular-highcharts';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
    HttpClientModule,
    InterceptorsModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
    ChartModule
  ],
  providers: [
    LoginService,
    StorageService,
    NotificationService,
    NgxSpinnerService,
    AppService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
