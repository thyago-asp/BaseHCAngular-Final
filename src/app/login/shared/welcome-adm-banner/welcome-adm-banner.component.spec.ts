import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomeAdmBannerComponent } from './welcome-adm-banner.component';

describe('WelcomeAdmBannerComponent', () => {
  let component: WelcomeAdmBannerComponent;
  let fixture: ComponentFixture<WelcomeAdmBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WelcomeAdmBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeAdmBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
