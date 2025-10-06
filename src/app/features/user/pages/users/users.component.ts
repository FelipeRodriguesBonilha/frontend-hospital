import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ReturnPaginated } from '../../../../core/models/pagination/return-paginated.model';
import { ReturnUser } from '../../../../core/models/user/return-user.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { UserService } from '../../../../core/services/user/user.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { CpfPipe } from '../../../../shared/pipes/cpf.pipe';
import { PhonePipe } from '../../../../shared/pipes/phone.pipe';
import { SocketService } from '../../../../core/services/socket/socket.service';


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
    MatButtonModule,
    MatSnackBarModule,
    MatPaginatorModule,
    CpfPipe,
    PhonePipe
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

  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private socketService: SocketService
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
          return this.userService.findAllUsers({
            name: term || '',
            page: this.pageIndex + 1,
            limit: this.pageSize
          });
        } else if (this.rolesLoadUsersByHospital.includes(this.user.role.name)) {
          return this.userService.findUsersByHospital(this.user.hospitalId!, {
            name: term || '',
            page: this.pageIndex + 1,
            limit: this.pageSize
          });
        } else {
          return [];
        }
      })
    ).subscribe({
      next: (response: ReturnPaginated<ReturnUser>) => {
        this.users = response.data;
        this.filteredUsers = response.data;
        this.totalItems = response.total;
        this.pageIndex = response.page - 1;
        this.pageSize = response.limit;
      },
      error: (err: HttpErrorResponse) => this.showError(err)
    });

    this.socketService.onUserDeleted((deletedUser: ReturnUser) => {
      this.snackBar.open('Usuário excluído com sucesso.', 'Fechar', {
        duration: 3000,
        verticalPosition: 'top'
      });

      if (this.rolesLoadUsers.includes(this.user.role.name)) this.loadUsers();
      else if (this.rolesLoadUsersByHospital.includes(this.user.role.name)) this.loadUsersByHospital();
      else {
        this.users = [];
        this.filteredUsers = [];
      }
    })
  }

  loadUsers() {
    this.userService.findAllUsers({
      name: this.searchControl.value || '',
      page: this.pageIndex + 1,
      limit: this.pageSize
    }).subscribe({
      next: (response: ReturnPaginated<ReturnUser>) => {
        this.users = response.data;
        this.filteredUsers = response.data;
        this.totalItems = response.total;
        this.pageIndex = response.page - 1;
        this.pageSize = response.limit;
      },
      error: (err: HttpErrorResponse) => this.showError(err)
    });
  }

  loadUsersByHospital() {
    this.userService.findUsersByHospital(this.user.hospitalId!, {
      name: this.searchControl.value || '',
      page: this.pageIndex + 1,
      limit: this.pageSize
    }).subscribe({
      next: (response: ReturnPaginated<ReturnUser>) => {
        this.users = response.data;
        this.filteredUsers = response.data;
        this.totalItems = response.total;
        this.pageIndex = response.page - 1;
        this.pageSize = response.limit;
      },
      error: (err: HttpErrorResponse) => this.showError(err)
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    if (this.rolesLoadUsers.includes(this.user.role.name)) {
      this.loadUsers();
    } else if (this.rolesLoadUsersByHospital.includes(this.user.role.name)) {
      this.loadUsersByHospital();
    }
  }

  showError(err: HttpErrorResponse) {
    const errorMessage = err?.error?.message || 'Erro inesperado. Tente novamente.';
    this.snackBar.open(errorMessage, 'Fechar', {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: ['mat-warn']
    });
  }

  deleteUser(user: ReturnUser) {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '400px',
      data: { message: `Tem certeza que deseja excluir o usuário "${user.name}"?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.socketService.deleteUser(user.id);
        this.userService.deleteUser(user.id).subscribe({
          next: () => {

          },
          error: (err: HttpErrorResponse) => this.showError(err)
        });
      }
    });
  }
}