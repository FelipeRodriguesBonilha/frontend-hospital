import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ReturnExam } from '../../core/models/exam/return-exam';
import { ReturnUser } from '../../core/models/user/return-user.model';
import { AuthService } from '../../core/services/auth/auth.service';
import { ExamService } from '../../core/services/exam/exam.service';

@Component({
  selector: 'app-exams',
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
  templateUrl: './exams.component.html',
  styleUrl: './exams.component.css'
})
export class ExamsComponent {
  user!: ReturnUser;
  exams: ReturnExam[] = [];
  filteredExams: ReturnExam[] = [];
  searchControl = new FormControl('');

  rolesLoadExams = ["AdminGeral"]
  rolesLoadExamsByHospital = ["AdminHospital", "Recepcionista", "Medico"]

  constructor(
    private examService: ExamService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.user = user;

        if (this.rolesLoadExams.includes(user.role.name)) this.loadExams();
        else if (this.rolesLoadExamsByHospital.includes(user.role.name)) this.loadExamsByHospital();
        else {
          this.exams = [];
          this.filteredExams = [];
        }
      }
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        if (this.rolesLoadExams.includes(this.user.role.name)) {
          return this.examService.findAllExams(term || '');
        } else if (this.rolesLoadExamsByHospital.includes(this.user.role.name)) {
          return this.examService.findExamsByHospital(this.user.hospitalId, term || '');
        } else {
          return [];
        }
      })
    ).subscribe({
      next: (exams: ReturnExam[]) => {
        this.exams = exams;
        this.filteredExams = exams;
      },
      error: (err) => console.error('Erro na busca de usuários:', err)
    });
  }

  loadExams(term: string = '') {
    this.examService.findAllExams(term).subscribe({
      next: (exams: ReturnExam[]) => {
        this.exams = exams;
        this.filteredExams = exams;
      }
    });
  }

  loadExamsByHospital(term: string = '') {
    this.examService.findExamsByHospital(this.user.hospitalId!, term).subscribe({
      next: (exams: ReturnExam[]) => {
        this.exams = exams;
        this.filteredExams = exams;
      }
    });
  }

  deleteExam(exam: ReturnExam, event: Event) {

  }

  selectExam(exam: ReturnExam) {

  }
}
