export interface IUser {
    name: string,
    pendingSyncTokens: string[],
    activeSyncTokens: string[],
    uid: string
}