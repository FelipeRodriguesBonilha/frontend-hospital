import { Routes } from '@angular/router';
import { Role } from './core/enums/role.enum';
import { authGuard } from './core/guards/auth/auth.guard';
import { loginGuard } from './core/guards/login/login.guard';
import { ForgotPasswordComponent } from './features/auth/pages/forgot-password/forgot-password.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { ResetPasswordComponent } from './features/auth/pages/reset-password/reset-password.component';
import { ChatRoomsComponent } from './features/chat/pages/chat-rooms/chat-rooms.component';
import { ExamFormComponent } from './features/exam/pages/exam-form/exam-form.component';
import { ExamsComponent } from './features/exam/pages/exams/exams.component';
import { HospitalFormComponent } from './features/hospital/pages/hospital-form/hospital-form.component';
import { HospitalsComponent } from './features/hospital/pages/hospitals/hospitals.component';
import { PatientFormComponent } from './features/patient/pages/patient-form/patient-form.component';
import { PatientsComponent } from './features/patient/pages/patients/patients.component';
import { SchedulingFormComponent } from './features/scheduling/pages/scheduling-form/scheduling-form.component';
import { SchedulingsComponent } from './features/scheduling/pages/schedulings/schedulings.component';
import { UnauthorizedComponent } from './features/unauthorized/pages/unauthorized/unauthorized.component';
import { UserFormComponent } from './features/user/pages/user-form/user-form.component';
import { UsersComponent } from './features/user/pages/users/users.component';
import { LayoutComponent } from './layouts/layout/layout.component';
import { ChatMessagesComponent } from './features/chat/components/chat-messages/chat-messages.component';
import { ExamsReportComponent } from './features/report/pages/exams-report/exams-report.component';
import { ProfileEditComponent } from './features/user/pages/profile-edit/profile-edit.component';
import { ChatMessagesReportComponent } from './features/report/pages/chat-messages-report/chat-messages-report.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        canActivate: [loginGuard],
        component: LoginComponent,
    },
    {
        path: 'forgot-password',
        canActivate: [loginGuard],
        component: ForgotPasswordComponent,
    },
    { path: 'reset-password', component: ResetPasswordComponent },
    {
        path: '',
        component: LayoutComponent,
        canActivateChild: [authGuard],
        children: [
            {
                path: 'unauthorized',
                component: UnauthorizedComponent,
            },
            {
                path: 'chat', component: ChatRoomsComponent, data: {
                    roles: [
                        Role.AdministradorHospital, Role.Medico, Role.Recepcionista
                    ]
                }
            },
            { path: 'hospitals', component: HospitalsComponent, data: { roles: [Role.AdministradorGeral] } },
            { path: 'hospitals/create', component: HospitalFormComponent, data: { roles: [Role.AdministradorGeral] } },
            { path: 'hospitals/:hospitalId/edit', component: HospitalFormComponent, data: { roles: [Role.AdministradorGeral] } },
            { path: 'users', component: UsersComponent, data: { roles: [Role.AdministradorGeral, Role.AdministradorHospital] } },
            { path: 'users/create', component: UserFormComponent, data: { roles: [Role.AdministradorGeral, Role.AdministradorHospital] } },
            { path: 'users/:userId/edit', component: UserFormComponent, data: { roles: [Role.AdministradorGeral, Role.AdministradorHospital] } },
            {
                path: 'schedulings', component: SchedulingsComponent, data: {
                    roles: [
                        Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista
                    ]
                }
            },
            {
                path: 'schedulings/create', component: SchedulingFormComponent, data: {
                    roles: [
                        Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista
                    ]
                }
            },
            {
                path: 'schedulings/:schedulingId/edit', component: SchedulingFormComponent, data: {
                    roles: [
                        Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista
                    ]
                }
            },
            {
                path: 'exams', component: ExamsComponent, data: {
                    roles: [
                        Role.AdministradorGeral, Role.AdministradorHospital, Role.Medico, Role.Recepcionista
                    ]
                }
            },
            {
                path: 'exams/create', component: ExamFormComponent, data: {
                    roles: [
                        Role.AdministradorGeral, Role.AdministradorHospital, Role.Medico, Role.Recepcionista
                    ]
                }
            },
            {
                path: 'exams/:examId/edit', component: ExamFormComponent, data: {
                    roles: [
                        Role.AdministradorGeral, Role.AdministradorHospital, Role.Medico, Role.Recepcionista
                    ]
                }
            },
            {
                path: 'patients', component: PatientsComponent, data: {
                    roles: [
                        Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista
                    ]
                }
            },
            {
                path: 'patients/create', component: PatientFormComponent, data: {
                    roles: [
                        Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista
                    ]
                }
            },
            {
                path: 'patients/:patientId/edit', component: PatientFormComponent, data: {
                    roles: [
                        Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista
                    ]
                }
            },
            {
                path: 'chat-messages-report', component: ChatMessagesReportComponent, data: {
                    roles: [
                        Role.AdministradorHospital
                    ]
                }
            },
            {
                path: 'exams-report', component: ExamsReportComponent, data: {
                    roles: [
                        Role.AdministradorHospital
                    ]
                }
            },
            {
                path: 'profile', component: ProfileEditComponent, data: {
                    roles: [
                        Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico
                    ]
                }
            },
            {
                path: '**',
                redirectTo: '/unauthorized'
            }
        ],
    },
];
