export interface EncodedFile {
    name: string;
    type: string;
    content: string;
}

export interface CreateMessage {
    content: string,
    roomId: string,
    files?: EncodedFile[]; 
}