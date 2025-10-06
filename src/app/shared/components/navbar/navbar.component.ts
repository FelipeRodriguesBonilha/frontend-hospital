import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Role } from '../../../core/enums/role.enum';
import { ReturnUser } from '../../../core/models/user/return-user.model';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NgClass } from '@angular/common';

interface Nav {
  name: string;
  route: string;
  roles: Role[];
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, MatButtonModule, NgClass],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private sub!: Subscription;
  user!: ReturnUser;

  isMenuOpen = false;

  readonly allNavs: Nav[] = [
    { name: 'Chat', route: '/chat', roles: [Role.AdministradorHospital, Role.Medico, Role.Recepcionista] },
    { name: 'Hospitais', route: '/hospitals', roles: [Role.AdministradorGeral] },
    { name: 'Usuários', route: '/users', roles: [Role.AdministradorGeral, Role.AdministradorHospital] },
    { name: 'Agendamentos', route: '/schedulings', roles: [Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista] },
    { name: 'Exames', route: '/exams', roles: [Role.AdministradorGeral, Role.AdministradorHospital, Role.Medico, Role.Recepcionista] },
    { name: 'Pacientes', route: '/patients', roles: [Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista] },
    { name: 'Relatório de Chat', route: '/chat-messages-report', roles: [Role.AdministradorHospital] },
    { name: 'Relatório de Exames', route: '/exams-report', roles: [Role.AdministradorHospital] },
  ];

  navs: Nav[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.sub = this.authService.currentUser$.subscribe((user) => {
      if (!user) {
        this.navs = [];
        return;
      }
      this.user = user;
      this.filterNavsByRole(user.role.name as Role);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private filterNavsByRole(role: Role): void {
    this.navs = this.allNavs.filter((nav) => nav.roles.includes(role));
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
    this.isMenuOpen = false;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
