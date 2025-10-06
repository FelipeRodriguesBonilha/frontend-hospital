import { ReturnArchive } from "../archive/return-archive.model";
import { ReturnRoom } from "../room/return-room.model";
import { ReturnUser } from "../user/return-user.model";

export interface ReturnMessage {
    id: string;
    content: string;
    senderId: string;
    roomId: string;
    sender: ReturnUser;
    createdAt?: Date;
    seenByAll?: boolean;
    room: ReturnRoom;

    archives?: ReturnArchive[];
}