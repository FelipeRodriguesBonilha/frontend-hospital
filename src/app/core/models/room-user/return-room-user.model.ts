import { ReturnRoom } from "../room/return-room.model";
import { ReturnUser } from "../user/return-user.model";

export interface ReturnRoomUser {
    id: string;
    roomId: string;
    userId: string;
    user: ReturnUser;
    room: ReturnRoom;
}