export interface ReturnExamsReport {
    providerId: string;
    providerName: string;
    hospitalName: string;
    totalExams: number;
    lastPatientName: string | null;
    lastExamDate: Date | null;
}