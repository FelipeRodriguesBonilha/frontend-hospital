import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { ChatRoomsComponent } from './pages/chat/chat-rooms/chat-rooms.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { HospitalsComponent } from './pages/hospitals/hospitals.component';
import { UsersComponent } from './pages/users/users.component';
import { SchedulingsComponent } from './pages/schedulings/schedulings.component';
import { PatientsComponent } from './pages/patients/patients.component';
import { ExamsComponent } from './pages/exams/exams.component';

export const routes: Routes = [
    { 
        path: '', component: LoginComponent 
    },
    { 
        path: '', 
        component: LayoutComponent,
        children: [
            { path: 'chat', component: ChatRoomsComponent },
            { path: 'hospitals', component: HospitalsComponent },
            { path: 'users', component: UsersComponent },
            { path: 'schedulings', component: SchedulingsComponent },
            { path: 'exams', component: ExamsComponent },
            { path: 'patients', component: PatientsComponent },
        ]
    }
];
