import { SetMetadata } from '@nestjs/common';

export const SKIP_AUTH_KEY = 'SkipAuth';
export const SkipAuth = () => SetMetadata(SKIP_AUTH_KEY, true);