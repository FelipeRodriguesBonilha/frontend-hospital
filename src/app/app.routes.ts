import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { ChatRoomsComponent } from './pages/chat/chat-rooms/chat-rooms.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { HospitalsComponent } from './pages/hospitals/hospitals.component';
import { UsersComponent } from './pages/users/users.component';
import { SchedulingsComponent } from './pages/schedulings/schedulings.component';
import { PatientsComponent } from './pages/patients/patients.component';
import { ExamsComponent } from './pages/exams/exams.component';
import { HospitalFormComponent } from './pages/hospitals/hospital-form/hospital-form.component';
import { UserFormComponent } from './pages/users/user-form/user-form.component';
import { SchedulingFormComponent } from './pages/schedulings/scheduling-form/scheduling-form.component';
import { PatientFormComponent } from './pages/patients/patient-form/patient-form.component';
import { ExamFormComponent } from './pages/exams/exam-form/exam-form.component';

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
            { path: 'hospitals/create', component: HospitalFormComponent },
            { path: 'hospitals/:hospitalId/edit', component: HospitalFormComponent },
            { path: 'users', component: UsersComponent },
            { path: 'users/create', component: UserFormComponent },
            { path: 'users/:userId/edit', component: UserFormComponent },
            { path: 'schedulings', component: SchedulingsComponent },
            { path: 'schedulings/create', component: SchedulingFormComponent },
            { path: 'schedulings/:schedulingId/edit', component: SchedulingFormComponent },
            { path: 'exams', component: ExamsComponent },
            { path: 'exams/create', component: ExamFormComponent },
            { path: 'exams/:examId/edit', component: ExamFormComponent },
            { path: 'patients', component: PatientsComponent },
            { path: 'patients/create', component: PatientFormComponent },
            { path: 'patients/:patientId/edit', component: PatientFormComponent },
        ]
    }
];
