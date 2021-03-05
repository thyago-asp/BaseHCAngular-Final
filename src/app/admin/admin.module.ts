import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './admin-routing.module';
import { HeaderComponent } from './header/header.component';
import { NavigatorComponent } from './navigator/navigator.component';
import { HomeComponent } from './pages/home/home.component';
import { ListComponent } from './pages/list/list.component';
import { InfectedComponent } from './pages/infected/infected.component';
import { TestedComponent } from './pages/tested/tested.component';
import { NeededComponent } from './pages/needed/needed.component';
import { ProbabilityComponent } from './pages/probability/probability.component';
import { ContactedComponent } from './pages/contacted/contacted.component';
import { RiskComponent } from './pages/risk/risk.component';
import { SymptomsComponent } from './pages/symptoms/symptoms.component';
import { GenderComponent } from './pages/gender/gender.component';
import { BehaviorComponent } from './pages/behavior/behavior.component';
import { WorkplaceComponent } from './pages/workplace/workplace.component';
import { HygieneComponent } from './pages/hygiene/hygiene.component';
import { OtherComponent } from './pages/other/other.component';
import { StatusBarComponent } from './shared/status-bar/status-bar.component';
import { PageTitleComponent } from './shared/page-title/page-title.component';
import { PeriodSelectComponent } from './shared/period-select/period-select.component';
import { SendForAllComponent } from './shared/send-for-all/send-for-all.component';
import { UserInfoComponent } from './shared/user-info/user-info.component';
import { ChartModule, HIGHCHARTS_MODULES } from 'angular-highcharts';
import { DropListComponent } from './shared/drop-list/drop-list.component';
import { DropListItemComponent } from './shared/drop-list-item/drop-list-item.component';
import { GenderGraphComponent } from './shared/gender-graph/gender-graph.component';
import * as highmaps from 'highcharts/modules/map.src';
import { HighchartsChartModule } from 'highcharts-angular';
import { MessageModalComponent } from './shared/message-modal/message-modal.component';
import { EngageComponent } from './pages/engage/engage.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        AdminRoutingModule,
        ChartModule,
        HighchartsChartModule
    ],
    declarations: [
        AdminComponent,
        HeaderComponent,
        NavigatorComponent,
        HomeComponent,
        ListComponent,
        InfectedComponent,
        TestedComponent,
        NeededComponent,
        ProbabilityComponent,
        ContactedComponent,
        RiskComponent,
        SymptomsComponent,
        GenderComponent,
        BehaviorComponent,
        WorkplaceComponent,
        HygieneComponent,
        OtherComponent,
        StatusBarComponent,
        PageTitleComponent,
        PeriodSelectComponent,
        SendForAllComponent,
        UserInfoComponent,
        DropListComponent,
        DropListItemComponent,
        GenderGraphComponent,
        MessageModalComponent,
        EngageComponent,
    ],
    providers: [
        { provide: HIGHCHARTS_MODULES, useFactory: () => [ highmaps ] }
    ]
})
export class AdminModule { }