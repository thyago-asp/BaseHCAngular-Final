import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { SERVER_API_URL } from 'src/environments/environment';
import { StorageService } from './storage.service';

export class RequestInterceptor implements HttpInterceptor {

    constructor(
        private _storage: StorageService,
        private _spinner: NgxSpinnerService
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this._spinner.show();
        if (!request || !request.url || (/^http/.test(request.url) && !(SERVER_API_URL && request.url.startsWith(SERVER_API_URL)))) {
            return next.handle(request);
        }

        const token = this._storage.getData('LoggedUser') ? this._storage.getData('LoggedUser').jwt : '';

        if (!!token) {
            request = request.clone({
                setHeaders: {
                    Authorization: 'Bearer ' + token
                }
            });
        }
        return next.handle(request);
    }

}
