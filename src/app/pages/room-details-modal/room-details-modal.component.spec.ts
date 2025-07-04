import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomDetailsModalComponent } from './room-details-modal.component';

describe('RoomDetailsModalComponent', () => {
  let component: RoomDetailsModalComponent;
  let fixture: ComponentFixture<RoomDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomDetailsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
