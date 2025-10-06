import { ReturnUser } from "../user/return-user.model";

export interface ReturnRoom {
    id: string;
    hospitalId: string;
    name: string;
    description: string;
    adminId: string;

    admin: ReturnUser;
}