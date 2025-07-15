import { ReturnArchive } from "../archive/return-archive";
import { ReturnHospital } from "../hospital/return-hospital";
import { ReturnPatient } from "../patient/return-patient";
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