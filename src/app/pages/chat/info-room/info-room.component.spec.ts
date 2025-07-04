import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoRoomComponent } from './info-room.component';

describe('InfoRoomComponent', () => {
  let component: InfoRoomComponent;
  let fixture: ComponentFixture<InfoRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoRoomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
