import { ReturnUser } from "../user/return-user.model";

export interface ReturnLogin {
    accessToken: string;
    user: ReturnUser;
}