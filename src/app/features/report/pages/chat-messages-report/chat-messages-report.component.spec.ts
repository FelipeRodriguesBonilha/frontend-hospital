import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMessagesReportComponent } from './chat-messages-report.component';

describe('ChatMessagesReportComponent', () => {
  let component: ChatMessagesReportComponent;
  let fixture: ComponentFixture<ChatMessagesReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMessagesReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatMessagesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
