import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropListItemComponent } from './drop-list-item.component';

describe('DropListItemComponent', () => {
  let component: DropListItemComponent;
  let fixture: ComponentFixture<DropListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
