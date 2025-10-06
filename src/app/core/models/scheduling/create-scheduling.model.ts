export interface CreateScheduling {
    hospitalId: string;
    providerId: string;
    patientId: string;
    observation?: string;
    startDate: string;
    endDate: string;
}