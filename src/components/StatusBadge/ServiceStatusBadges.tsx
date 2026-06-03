import StatusBadge from '@app/components/StatusBadge';
import { MediaStatus } from '@server/constants/media';
import type MediaServiceStatus from '@server/entity/MediaServiceStatus';
import type { ServiceCommonServer } from '@server/interfaces/api/serviceInterfaces';
import useSWR from 'swr';

const STATUS_LABEL: Partial<Record<MediaStatus, string>> = {
  [MediaStatus.AVAILABLE]: 'Available',
  [MediaStatus.PARTIALLY_AVAILABLE]: 'Partially Available',
  [MediaStatus.PROCESSING]: 'Processing',
};

interface ServiceStatusBadgesProps {
  serviceStatuses?: MediaServiceStatus[];
  mediaType: 'movie' | 'tv';
  plexUrl?: string;
  tmdbId?: number;
}

const ServiceStatusBadges = ({
  serviceStatuses,
  mediaType,
  plexUrl,
  tmdbId,
}: ServiceStatusBadgesProps) => {
  const { data: services } = useSWR<ServiceCommonServer[]>(
    serviceStatuses?.length
      ? `/api/v1/service/${mediaType === 'movie' ? 'radarr' : 'sonarr'}`
      : null
  );

  if (!services || !serviceStatuses?.length) return null;

  const items = serviceStatuses
    .filter(
      (ss) =>
        ss.status !== MediaStatus.UNKNOWN && ss.status !== MediaStatus.DELETED
    )
    .map((ss) => {
      const server = services.find((s) => s.id === ss.serviceId);
      if (!server) return null;
      return { server, status: ss.status };
    })
    .filter(
      (x): x is { server: ServiceCommonServer; status: MediaStatus } =>
        x !== null
    );

  if (!items.length) return null;

  return (
    <>
      {items.map(({ server, status }) => (
        <StatusBadge
          key={`service-badge-${server.id}`}
          status={status}
          statusLabelOverride={`${STATUS_LABEL[status] ?? 'In'} in ${server.buttonLabel ?? server.name}`}
          mediaType={mediaType}
          plexUrl={plexUrl}
          tmdbId={tmdbId}
        />
      ))}
    </>
  );
};

export default ServiceStatusBadges;
