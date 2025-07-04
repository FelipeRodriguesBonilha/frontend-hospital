import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { ChatRoomsComponent } from './pages/chat/chat-rooms/chat-rooms.component';
import { LayoutComponent } from './pages/layout/layout.component';

export const routes: Routes = [
    { 
        path: '', component: LoginComponent 
    },
    { 
        path: '', 
        component: LayoutComponent,
        children: [
            { path: 'chat', component: ChatRoomsComponent}
        ]
    }
];
