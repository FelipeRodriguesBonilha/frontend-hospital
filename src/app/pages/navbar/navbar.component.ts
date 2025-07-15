import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReturnUser } from '../../core/models/user/return-user.model';
import { AuthService } from '../../core/services/auth/auth.service';

interface Nav {
  name: string;
  route: string;
  role: string[];
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  user!: ReturnUser;

  allNavs: Nav[] = [
    {
      name: 'Chat',
      route: '/chat',
      role: ['AdminHospital', 'Medico', 'Recepcionista']
    },
    {
      name: 'Hospitais',
      route: '/hospitals',
      role: ['AdminGeral']
    },
    {
      name: 'Usuários',
      route: '/users',
      role: ['AdminGeral', 'AdminHospital', 'AdminHospital']
    },
    {
      name: 'Agendamentos',
      route: '/schedulings',
      role: ['AdminGeral', 'AdminHospital', 'Recepcionista']
    },
    {
      name: 'Exames',
      route: '/exams',
      role: ['AdminGeral', 'AdminHospital', 'Medico', 'Recepcionista']
    },
    {
      name: 'Pacientes',
      route: '/patients',
      role: ['AdminGeral', 'AdminHospital', 'Recepcionista']
    },
  ];

  navs: Nav[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        this.navs = [];
        return;
      }

      this.user = user;
      this.filterNavsByRole(user.role.name);
    });
  }

  private filterNavsByRole(roleName: string) {
    this.navs = this.allNavs.filter(nav =>
      nav.role.includes(roleName)
    );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['']);
  }
}
