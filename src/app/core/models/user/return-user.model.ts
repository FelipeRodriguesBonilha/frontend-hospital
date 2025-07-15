import { ReturnHospital } from "../hospital/return-hospital";
import { ReturnRole } from "../role/return-role";

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