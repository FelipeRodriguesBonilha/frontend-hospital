export interface CreatePatient {
    hospitalId: string;
    name: string;
    cpf: string;
    phone: string;
    email: string;
    address?: string;
}