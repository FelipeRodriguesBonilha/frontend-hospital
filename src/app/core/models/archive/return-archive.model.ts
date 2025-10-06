import { ReturnMessage } from "../message/return-message.model";

export interface ReturnArchive {
    name: string;
    type: string;
    url: string;
    messageId?: string;
    message?: ReturnMessage;
}