import { Component } from '@angular/core';
import { ChatRoomsComponent } from '../chat/chat-rooms/chat-rooms.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [ChatRoomsComponent, NavbarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {

}
