import { ReturnArchive } from "../archive/return-archive.model";
import { ReturnHospital } from "../hospital/return-hospital.model";
import { ReturnPatient } from "../patient/return-patient.model";
import { ReturnUser } from "../user/return-user.model";

export interface ReturnExam {
    id: string;
    hospitalId: string;
    createdById: string;
    providerId: string;
    patientId: string;
    archiveId?: string;
    description: string;

    hospital?: ReturnHospital;
    createdBy?: ReturnUser;
    provider?: ReturnUser;
    patient?: ReturnPatient;
    archive?: ReturnArchive;
}