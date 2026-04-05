import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (request.user?.role === 'admin') {
      return true;
    }
    throw new ForbiddenException('ليس لديك صلاحية لهذا الإجراء');
  }
}
