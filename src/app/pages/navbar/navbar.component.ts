import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface nav {
  name: string,
  route: string
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  navs: nav[] = [
    {
      name: "Chat",
      route: "/chat"
    },
    {
      name: "Hospitais",
      route: "/hospitals"
    },
    {
      name: "Usuários",
      route: "/users"
    },
    {
      name: "Agendamentos",
      route: "/schedulings"
    },
    {
      name: "Exames",
      route: "/exams"
    },
    {
      name: "Pacientes",
      route: "/patients"
    },
  ]
}
