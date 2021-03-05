import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CtgAdmTitleComponent } from './ctg-adm-title.component';

describe('CtgAdmTitleComponent', () => {
  let component: CtgAdmTitleComponent;
  let fixture: ComponentFixture<CtgAdmTitleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CtgAdmTitleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CtgAdmTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
