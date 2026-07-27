import { getRepository } from '@server/datasource';
import { User } from '@server/entity/User';
import logger from '@server/logger';

/**
 * Removes a deleted server's identifier from every user's requestServices
 * grants. Server IDs are reused after deletion, so a stale grant would
 * otherwise silently apply to whichever server is created with that ID next.
 */
export async function removeRequestServiceGrants(
  serviceType: 'radarr' | 'sonarr',
  serviceId: number
): Promise<void> {
  const identifier = `${serviceType}:${serviceId}`;
  const userRepository = getRepository(User);

  // requestServices is stored as JSON text (e.g. ["radarr:0","sonarr:1"]) —
  // the quoted token match finds candidates in SQL; the JS filter is exact.
  const users = await userRepository
    .createQueryBuilder('user')
    .where('user.requestServices LIKE :identifier', {
      identifier: `%"${identifier}"%`,
    })
    .getMany();

  for (const user of users) {
    user.requestServices = (user.requestServices ?? []).filter(
      (grant) => grant !== identifier
    );
    await userRepository.save(user);
  }

  if (users.length > 0) {
    logger.info(
      `Removed the ${identifier} request service grant from ${users.length} user(s)`,
      { label: 'Settings' }
    );
  }
}
