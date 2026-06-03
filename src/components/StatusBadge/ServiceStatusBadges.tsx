import StatusBadge from '@app/components/StatusBadge';
import globalMessages from '@app/i18n/globalMessages';
import { MediaStatus } from '@server/constants/media';
import type MediaServiceStatus from '@server/entity/MediaServiceStatus';
import type { ServiceCommonServer } from '@server/interfaces/api/serviceInterfaces';
import { useIntl } from 'react-intl';
import useSWR from 'swr';

interface ServiceStatusBadgesProps {
  serviceStatuses?: MediaServiceStatus[];
  mediaType: 'movie' | 'tv';
  plexUrl?: string;
  tmdbId?: number;
  // When set, render per-season status for this season number instead of the
  // overall show status.
  seasonNumber?: number;
}

const ServiceStatusBadges = ({
  serviceStatuses,
  mediaType,
  plexUrl,
  tmdbId,
  seasonNumber,
}: ServiceStatusBadgesProps) => {
  const intl = useIntl();
  const { data: services } = useSWR<ServiceCommonServer[]>(
    serviceStatuses?.length
      ? `/api/v1/service/${mediaType === 'movie' ? 'radarr' : 'sonarr'}`
      : null
  );

  if (!services || !serviceStatuses?.length) return null;

  const statusLabel = (status: MediaStatus): string => {
    switch (status) {
      case MediaStatus.AVAILABLE:
        return intl.formatMessage(globalMessages.available);
      case MediaStatus.PARTIALLY_AVAILABLE:
        return intl.formatMessage(globalMessages.partiallyavailable);
      case MediaStatus.PROCESSING:
        return intl.formatMessage(globalMessages.processing);
      default:
        return '';
    }
  };

  const items = serviceStatuses
    .map((ss) => {
      const server = services.find((s) => s.id === ss.serviceId);
      if (!server) return null;
      // For a specific season, read the per-season status; otherwise the overall.
      const status =
        seasonNumber !== undefined
          ? ss.seasonStatuses?.[seasonNumber]
          : ss.status;
      if (
        status === undefined ||
        status === MediaStatus.UNKNOWN ||
        status === MediaStatus.DELETED
      ) {
        return null;
      }
      return { server, status };
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
          statusLabelOverride={`${statusLabel(status)} in ${server.buttonLabel ?? server.name}`}
          mediaType={mediaType}
          plexUrl={plexUrl}
          tmdbId={tmdbId}
        />
      ))}
    </>
  );
};

export default ServiceStatusBadges;
