import { Role } from "../roles/roles.enum";

export interface JWT {
    sub: number,
    email: string,
    roles: Role[],
    iat: number,
    exp: number
}