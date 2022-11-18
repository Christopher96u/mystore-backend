
import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { RequestWithUser } from '../interfaces/reques-with-user.interface';
import { Role } from '../roles/roles.enum';

const RoleGuard = (role: Role): Type<CanActivate> => {
    class RoleGuardMixin implements CanActivate {
        canActivate(context: ExecutionContext) {
            const request = context.switchToHttp().getRequest<RequestWithUser>();
            const user = request.user;
            console.log("roleGuard", user);
            return user?.roles.includes(role);
        }
    }

    return mixin(RoleGuardMixin);
}

export default RoleGuard;