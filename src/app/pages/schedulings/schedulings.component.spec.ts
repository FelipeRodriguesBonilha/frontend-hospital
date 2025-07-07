import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulingsComponent } from './schedulings.component';

describe('SchedulingsComponent', () => {
  let component: SchedulingsComponent;
  let fixture: ComponentFixture<SchedulingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchedulingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedulingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
