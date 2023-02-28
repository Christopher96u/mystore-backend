import { Role } from "../roles/roles.enum";

export interface JWT {
    sub: string,
    email: string,
    roles: Role[],
    iat: number,
    exp: number
}