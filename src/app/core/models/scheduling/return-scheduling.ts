import { ReturnHospital } from "../hospital/return-hospital";
import { ReturnPatient } from "../patient/return-patient";
import { ReturnUser } from "../user/return-user.model";

export interface ReturnScheduling {
    id: string;
    hospitalId: string;
    createdById: string;
    providerId: string;
    patientId: string;
    observation?: string;
    startDate: Date;
    endDate: Date;

    hospital?: ReturnHospital;
    createdBy?: ReturnUser;
    provider?: ReturnUser;
    patient?: ReturnPatient;
}