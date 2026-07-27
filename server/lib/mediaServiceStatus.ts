import type { MediaStatus } from '@server/constants/media';
import type MediaServiceStatus from '@server/entity/MediaServiceStatus';
import type { Repository } from 'typeorm';

export interface MediaServiceStatusValues {
  mediaId: number;
  serviceId: number;
  serviceType: 'radarr' | 'sonarr';
  status: MediaStatus;
  externalServiceId?: number | null;
  externalServiceSlug?: string | null;
  seasonStatuses?: Record<number, MediaStatus> | null;
}

/**
 * Upserts a per-service availability row keyed on the (mediaId, serviceId)
 * unique index using a single `INSERT ... ON CONFLICT DO UPDATE`.
 *
 * `serviceType` is written on insert only (it never changes for a given
 * media/service pair). `overwrite` lists the columns updated on conflict — the
 * request subscriber omits `seasonStatuses` so a movie/PROCESSING upsert can't
 * wipe per-season data written by a Sonarr scan.
 *
 * IMPORTANT: `updateEntity(false)` is required. On drivers without RETURNING
 * support (SQLite) TypeORM otherwise reloads the row's generated id via
 * `last_insert_rowid()`, which is not set on the DO UPDATE branch — throwing
 * "Cannot update entity because entity id is not set in the entity." We never
 * need the generated id back here, so the reload is skipped entirely.
 */
export async function upsertMediaServiceStatus(
  repo: Repository<MediaServiceStatus>,
  values: MediaServiceStatusValues,
  overwrite: (keyof MediaServiceStatusValues)[] = [
    'status',
    'externalServiceId',
    'externalServiceSlug',
  ]
): Promise<void> {
  await repo
    .createQueryBuilder()
    .insert()
    .values({
      ...values,
      externalServiceId: values.externalServiceId ?? null,
      externalServiceSlug: values.externalServiceSlug ?? null,
      seasonStatuses: values.seasonStatuses ?? null,
    })
    .orUpdate(overwrite as string[], ['mediaId', 'serviceId'])
    .updateEntity(false)
    .execute();
}
