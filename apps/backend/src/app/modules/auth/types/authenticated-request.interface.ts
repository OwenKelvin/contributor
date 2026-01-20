import { FastifyRequest } from 'fastify';
import { User } from '../../user/user.model';

export interface AuthenticatedRequest extends FastifyRequest {
  user: User;
}
