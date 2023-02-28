import { Request } from 'express';
import { User, UserDocument } from 'src/users/entities/user.entity';

export interface RequestWithUser extends Request {
    user: UserDocument;
}