import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { BehaviorComponent } from './pages/behavior/behavior.component';
import { ContactedComponent } from './pages/contacted/contacted.component';
import { EngageComponent } from './pages/engage/engage.component';
import { GenderComponent } from './pages/gender/gender.component';
import { HomeComponent } from './pages/home/home.component';
import { HygieneComponent } from './pages/hygiene/hygiene.component';
import { InfectedComponent } from './pages/infected/infected.component';
import { ListComponent } from './pages/list/list.component';
import { NeededComponent } from './pages/needed/needed.component';
import { OtherComponent } from './pages/other/other.component';
import { ProbabilityComponent } from './pages/probability/probability.component';
import { RiskComponent } from './pages/risk/risk.component';
import { SymptomsComponent } from './pages/symptoms/symptoms.component';
import { TestedComponent } from './pages/tested/tested.component';
import { WorkplaceComponent } from './pages/workplace/workplace.component';

const routes: Routes = [
    {
        path: '',
        component: AdminComponent,
        data: {},
        children: [
            {
                path: 'home',
                component: HomeComponent
            },
            {
                path: 'home/:unit',
                component: HomeComponent
            },
            {
                path: 'home/:unit/:period',
                component: HomeComponent
            },
            {
                path: 'lista-colaboradores',
                component: ListComponent
            },
            {
                path: 'colaboradores-infectados',
                component: InfectedComponent
            },
            {
                path: 'teste-realizado',
                component: TestedComponent
            },
            {
                path: 'necessitam-teste',
                component: NeededComponent
            },
            {
                path: 'probabilidades',
                component: ProbabilityComponent
            },
            {
                path: 'contato-infectados',
                component: ContactedComponent
            },
            {
                path: 'risco',
                component: RiskComponent
            },
            {
                path: 'sintomas',
                component: SymptomsComponent
            },
            {
                path: 'genero',
                component: GenderComponent
            },
            {
                path: 'comportamento',
                component: BehaviorComponent
            },
            {
                path: 'onde-trabalham',
                component: WorkplaceComponent
            },
            {
                path: 'higiene',
                component: HygieneComponent
            },
            {
                path: 'engage',
                component: EngageComponent
            },
        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class AdminRoutingModule { }