export interface Notification {
    id: string;
    receiverId: string;
    senderId: string;
    message: string;
    read: boolean;
    type: string;
    createdAt: Date;
}
