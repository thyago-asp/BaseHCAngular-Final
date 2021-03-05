import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendForAllComponent } from './send-for-all.component';

describe('SendForAllComponent', () => {
  let component: SendForAllComponent;
  let fixture: ComponentFixture<SendForAllComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendForAllComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendForAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
