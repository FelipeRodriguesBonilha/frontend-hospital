export interface CreateScheduling {
    hospitalId: string;
    createdById: string;
    providerId: string;
    patientId: string;
    observation?: string;
    startDate: string;
    endDate: string;
}