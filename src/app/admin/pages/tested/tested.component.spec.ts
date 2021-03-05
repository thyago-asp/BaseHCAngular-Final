import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestedComponent } from './tested.component';

describe('TestedComponent', () => {
  let component: TestedComponent;
  let fixture: ComponentFixture<TestedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
