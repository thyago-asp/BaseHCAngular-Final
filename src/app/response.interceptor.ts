import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NotificationService } from './notification.service';
import { NgxSpinnerService } from 'ngx-spinner';


export class ResponseInterceptor implements HttpInterceptor {

    constructor(
        private notification: NotificationService,
        private _spinner: NgxSpinnerService
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(tap((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
                this._spinner.hide();
                if ((event.status === 200 || event.status === 201) && event.body && event.body.showMessage) {
                    this.notification.success(event.body.message);
                }
            }
        }, (response: any) => {
            if (response instanceof HttpErrorResponse) {
                this._spinner.hide();
                switch (response.status) {
                    case 400:
                        this.notification.error('Verifique os dados e tente novamente!');
                        break;
                    case 403:
                        this.notification.error('Verifique se o seu email e senha estão corretos e tente novamente!');
                        break;
                    case 401:
                        this.notification.error('Por medidas de segurança o seu tempo de navegação expirou, realize o login novamente para continuar.');
                        break;
                    default:
                        console.error('Not Found - HttpErrorResponse: ', response);
                }

            }
        }));
    }
}
