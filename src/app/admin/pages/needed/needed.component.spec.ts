import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NeededComponent } from './needed.component';

describe('NeededComponent', () => {
  let component: NeededComponent;
  let fixture: ComponentFixture<NeededComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NeededComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeededComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
