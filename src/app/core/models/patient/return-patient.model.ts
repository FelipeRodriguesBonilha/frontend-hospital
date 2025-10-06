import { ReturnHospital } from "../hospital/return-hospital.model";

export interface ReturnPatient {
    id: string;
    hospitalId: string;
    name: string;
    cpf: string;
    phone: string;
    email: string;
    address?: string;

    hospital?: ReturnHospital;
}