export interface CreateExam {
    hospitalId: string;
    providerId: string;
    patientId: string;
    archiveId?: string;
    description: string;
}