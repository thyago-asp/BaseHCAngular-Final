import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodSelectComponent } from './period-select.component';

describe('PeriodSelectComponent', () => {
  let component: PeriodSelectComponent;
  let fixture: ComponentFixture<PeriodSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeriodSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
