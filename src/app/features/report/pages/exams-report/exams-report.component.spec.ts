import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamsReportComponent } from './exams-report.component';

describe('ExamsReportComponent', () => {
  let component: ExamsReportComponent;
  let fixture: ComponentFixture<ExamsReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamsReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
