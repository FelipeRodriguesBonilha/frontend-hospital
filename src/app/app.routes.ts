import { Routes } from '@angular/router';
import { LayoutComponent } from './pages/layout/layout.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { ChatComponent } from './pages/chat/chat/chat.component';

export const routes: Routes = [
    { 
        path: '', component: LoginComponent 
    },
    { 
        path: '', 
        component: LayoutComponent,
        children: [
            { path: 'chat', component: ChatComponent}
        ]
    }
];
