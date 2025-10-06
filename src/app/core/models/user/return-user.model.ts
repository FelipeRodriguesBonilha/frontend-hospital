import { ReturnHospital } from "../hospital/return-hospital.model";
import { ReturnRole } from "../role/return-role.model";

export interface ReturnUser {
    id: string;
    hospitalId: string;
    name: string;
    cpf: string;
    phone: string;
    email: string;
    roleId: string;
    hospital: ReturnHospital;
    role: ReturnRole;
}