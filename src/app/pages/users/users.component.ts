import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ReturnUser } from '../../core/models/user/return-user.model';
import { AuthService } from '../../core/services/auth/auth.service';
import { UserService } from '../../core/services/user/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    MatMenuModule,
    RouterLink,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  user!: ReturnUser;
  users: ReturnUser[] = [];
  filteredUsers: ReturnUser[] = [];
  searchControl = new FormControl('');

  rolesLoadUsers = ["AdminGeral"];
  rolesLoadUsersByHospital = ["AdminHospital"];

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.user = user;

        if (this.rolesLoadUsers.includes(user.role.name)) this.loadUsers();
        else if (this.rolesLoadUsersByHospital.includes(user.role.name)) this.loadUsersByHospital();
        else {
          this.users = [];
          this.filteredUsers = [];
        }
      }
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        if (this.rolesLoadUsers.includes(this.user.role.name)) {
          return this.userService.findAllUsers(term || '');
        } else if (this.rolesLoadUsersByHospital.includes(this.user.role.name)) {
          return this.userService.findUsersByHospital(this.user.hospitalId, term || '');
        } else {
          return [];
        }
      })
    ).subscribe({
      next: (users: ReturnUser[]) => {
        this.users = users;
        this.filteredUsers = users;
      },
      error: (err) => console.error('Erro na busca de usuários:', err)
    });
  }

  loadUsers(term: string = '') {
    this.userService.findAllUsers(term).subscribe({
      next: (users: ReturnUser[]) => {
        this.users = users;
        this.filteredUsers = users;
      }
    });
  }

  loadUsersByHospital(term: string = '') {
    this.userService.findUsersByHospital(this.user.hospitalId!, term).subscribe({
      next: (users: ReturnUser[]) => {
        this.users = users;
        this.filteredUsers = users;
      }
    });
  }

  deleteUser(user: ReturnUser, event: Event) {

  }

  selectUser(user: ReturnUser) {
    
  }
}
