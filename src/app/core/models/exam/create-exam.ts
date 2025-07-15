export interface CreateExam {
    hospitalId: string;
    createdById: string;
    providerId: string;
    patientId: string;
    archiveId?: string;
    description: string;
}