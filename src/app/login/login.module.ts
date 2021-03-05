import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login.component';
import { LoginRoutingModule } from './login-routing.module';
import { WelcomeAdmBannerComponent } from './shared/welcome-adm-banner/welcome-adm-banner.component';
import { CtgAdmTitleComponent } from './shared/ctg-adm-title/ctg-adm-title.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        LoginRoutingModule
    ],
    declarations: [
        LoginComponent,
        WelcomeAdmBannerComponent,
        CtgAdmTitleComponent
    ]
})
export class LoginModule { }