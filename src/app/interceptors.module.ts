import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from './notification.service';
import { RequestInterceptor } from './request.interceptor';
import { ResponseInterceptor } from './response.interceptor';
import { StorageService } from './storage.service';

@NgModule({
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ResponseInterceptor,
            multi: true,
            deps: [
                NotificationService,
                NgxSpinnerService
            ]
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: RequestInterceptor,
            multi: true,
            deps: [
                StorageService,
                NgxSpinnerService
            ]
        }
    ]
})
export class InterceptorsModule { }
