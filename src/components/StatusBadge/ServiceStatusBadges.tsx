import StatusBadge, { getStatusLabel } from '@app/components/StatusBadge';
import defineMessages from '@app/utils/defineMessages';
import { MediaStatus } from '@server/constants/media';
import type MediaServiceStatus from '@server/entity/MediaServiceStatus';
import type { ServiceCommonServer } from '@server/interfaces/api/serviceInterfaces';
import { useIntl } from 'react-intl';
import useSWR from 'swr';

const messages = defineMessages('components.StatusBadge.ServiceStatusBadges', {
  statusinservice: '{status} in {label}',
});

interface ServiceStatusBadgesProps {
  serviceStatuses?: MediaServiceStatus[];
  mediaType: 'movie' | 'tv';
  plexUrl?: string;
  tmdbId?: number;
  title?: string | string[];
  // When set, render per-season status for this season number instead of the
  // overall show status.
  seasonNumber?: number;
}

const ServiceStatusBadges = ({
  serviceStatuses,
  mediaType,
  plexUrl,
  tmdbId,
  title,
  seasonNumber,
}: ServiceStatusBadgesProps) => {
  const intl = useIntl();
  const { data: services } = useSWR<ServiceCommonServer[]>(
    serviceStatuses?.length
      ? `/api/v1/service/${mediaType === 'movie' ? 'radarr' : 'sonarr'}`
      : null
  );

  if (!services || !serviceStatuses?.length) return null;

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
      // Only surface live download progress for the overall show/movie badge,
      // not the per-season badges (those only ever render available statuses).
      const downloadItem =
        seasonNumber === undefined ? (ss.downloadStatus ?? []) : [];
      return { server, status, downloadItem };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (!items.length) return null;

  return (
    <>
      {items.map(({ server, status, downloadItem }) => (
        <StatusBadge
          key={`service-badge-${server.id}`}
          status={status}
          downloadItem={downloadItem}
          inProgress={downloadItem.length > 0}
          title={title}
          statusLabelOverride={intl.formatMessage(messages.statusinservice, {
            status: getStatusLabel(intl, status, downloadItem.length > 0),
            label: server.buttonLabel ?? server.name,
          })}
          mediaType={mediaType}
          plexUrl={plexUrl}
          tmdbId={tmdbId}
        />
      ))}
    </>
  );
};

export default ServiceStatusBadges;
