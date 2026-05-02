import Modal from '@app/components/Common/Modal';
import type { SonarrTestResponse } from '@app/components/Settings/SettingsServices';
import globalMessages from '@app/i18n/globalMessages';
import defineMessages from '@app/utils/defineMessages';
import { Transition } from '@headlessui/react';
import type { RadarrSettings, RequestProfile, SonarrSettings } from '@server/lib/settings';
import axios from 'axios';
import { Field, Formik } from 'formik';
import { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import Select from 'react-select';
import { useToasts } from 'react-toast-notifications';

const messages = defineMessages('components.Settings.RequestProfileModal', {
  createprofile: 'New Request Profile',
  editprofile: 'Edit Request Profile',
  create: 'Create profile',
  name: 'Profile Name',
  namePlaceholder: 'Enter profile name',
  mediaType: 'Media Type',
  selectMediaType: 'Select media type',
  movie: 'Movie',
  tv: 'TV Series',
  both: 'Both',
  service: 'Service',
  serviceDescription: 'Select the Radarr or Sonarr service to route requests to.',
  selectService: 'Select service',
  qualityprofile: 'Quality Profile',
  selectQualityProfile: 'Select quality profile',
  rootfolder: 'Root Folder',
  selectRootFolder: 'Select root folder',
  tags: 'Tags',
  notagoptions: 'No tags.',
  selecttags: 'Select tags',
  languageprofile: 'Language Profile',
  selectLanguageProfile: 'Select language profile',
  enabled: 'Enabled',
  profileCreated: 'Request profile created successfully!',
  profileUpdated: 'Request profile updated successfully!',
});

type OptionType = {
  value: number;
  label: string;
};

interface RequestProfileModalProps {
  profile: RequestProfile | null;
  onClose: () => void;
  radarrServices: RadarrSettings[];
  sonarrServices: SonarrSettings[];
}

const RequestProfileModal = ({
  onClose,
  profile,
  radarrServices,
  sonarrServices,
}: RequestProfileModalProps) => {
  const intl = useIntl();
  const { addToast } = useToasts();
  const [isValidated, setIsValidated] = useState(profile ? true : false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResponse, setTestResponse] = useState<
    SonarrTestResponse & { isSonarr?: boolean }
  >({
    profiles: [],
    rootFolders: [],
    tags: [],
    languageProfiles: null,
  });

  const getServiceInfos = useCallback(
    async (
      service: RadarrSettings | SonarrSettings,
      type: 'radarr' | 'sonarr'
    ) => {
      setIsTesting(true);
      try {
        const { hostname, port, apiKey, baseUrl, useSsl = false } = service;
        const response = await axios.post<SonarrTestResponse>(
          `/api/v1/settings/${type}/test`,
          {
            hostname,
            apiKey,
            port: Number(port),
            baseUrl,
            useSsl,
          }
        );

        setIsValidated(true);
        setTestResponse({ ...response.data, isSonarr: type === 'sonarr' });
      } catch {
        setIsValidated(false);
      } finally {
        setIsTesting(false);
      }
    },
    []
  );

  useEffect(() => {
    if (profile) {
      const radarrMatch = radarrServices.find((s) => s.id === profile.serviceId);
      if (radarrMatch) {
        getServiceInfos(radarrMatch, 'radarr');
        return;
      }
      const sonarrMatch = sonarrServices.find((s) => s.id === profile.serviceId);
      if (sonarrMatch) {
        getServiceInfos(sonarrMatch, 'sonarr');
      }
    }
  }, [
    getServiceInfos,
    radarrServices,
    sonarrServices,
    profile,
  ]);

  const resolveServiceType = (serviceId: number): 'radarr' | 'sonarr' | null => {
    if (radarrServices.find((s) => s.id === serviceId)) return 'radarr';
    if (sonarrServices.find((s) => s.id === serviceId)) return 'sonarr';
    return null;
  };

  return (
    <Transition
      as="div"
      appear
      show
      enter="transition-opacity ease-in-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity ease-in-out duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <Formik
        initialValues={{
          name: profile?.name ?? '',
          mediaType: profile?.mediaType ?? 'movie',
          serviceId: profile?.serviceId ?? null as number | null,
          qualityProfileId: profile?.qualityProfileId ?? null as number | null,
          rootFolder: profile?.rootFolder ?? '',
          tags: profile?.tags ?? [] as number[],
          languageProfileId: profile?.languageProfileId ?? null as number | null,
          enabled: profile?.enabled ?? true,
        }}
        onSubmit={async (values) => {
          try {
            const submission = {
              name: values.name,
              mediaType: values.mediaType,
              serviceId: values.serviceId,
              qualityProfileId: values.qualityProfileId || null,
              rootFolder: values.rootFolder || null,
              tags: values.tags.length > 0 ? values.tags : null,
              languageProfileId: values.languageProfileId || null,
              enabled: values.enabled,
            };
            if (!profile) {
              await axios.post('/api/v1/settings/request-profiles', submission);
              addToast(intl.formatMessage(messages.profileCreated), {
                appearance: 'success',
                autoDismiss: true,
              });
            } else {
              await axios.put(
                `/api/v1/settings/request-profiles/${profile.id}`,
                submission
              );
              addToast(intl.formatMessage(messages.profileUpdated), {
                appearance: 'success',
                autoDismiss: true,
              });
            }
            onClose();
          } catch {
            // handle error silently
          }
        }}
      >
        {({
          errors,
          touched,
          values,
          handleSubmit,
          setFieldValue,
          isSubmitting,
          isValid,
        }) => {
          return (
            <Modal
              onCancel={onClose}
              okButtonType="primary"
              okText={
                isSubmitting
                  ? intl.formatMessage(globalMessages.saving)
                  : profile
                    ? intl.formatMessage(globalMessages.save)
                    : intl.formatMessage(messages.create)
              }
              okDisabled={
                isSubmitting ||
                !isValid ||
                !values.name ||
                values.serviceId === null
              }
              onOk={() => handleSubmit()}
              title={
                !profile
                  ? intl.formatMessage(messages.createprofile)
                  : intl.formatMessage(messages.editprofile)
              }
            >
              <div className="mb-6">
                <div className="form-row">
                  <label htmlFor="name" className="text-label">
                    {intl.formatMessage(messages.name)}
                  </label>
                  <div className="form-input-area">
                    <div className="form-input-field">
                      <Field
                        id="name"
                        name="name"
                        type="text"
                        placeholder={intl.formatMessage(messages.namePlaceholder)}
                      />
                    </div>
                    {errors.name && touched.name && typeof errors.name === 'string' && (
                      <div className="error">{errors.name}</div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <label htmlFor="mediaType" className="text-label">
                    {intl.formatMessage(messages.mediaType)}
                  </label>
                  <div className="form-input-area">
                    <div className="form-input-field">
                      <Field as="select" id="mediaType" name="mediaType">
                        <option value="movie">
                          {intl.formatMessage(messages.movie)}
                        </option>
                        <option value="tv">
                          {intl.formatMessage(messages.tv)}
                        </option>
                        <option value="both">
                          {intl.formatMessage(messages.both)}
                        </option>
                      </Field>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <label htmlFor="serviceId" className="text-label">
                    {intl.formatMessage(messages.service)}
                  </label>
                  <div className="form-input-area">
                    <p className="description">
                      {intl.formatMessage(messages.serviceDescription)}
                    </p>
                    <div className="form-input-field">
                      <select
                        id="serviceId"
                        name="serviceId"
                        defaultValue={
                          profile?.serviceId != null
                            ? `${resolveServiceType(profile.serviceId)}-${profile.serviceId}`
                            : ''
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            setFieldValue('serviceId', null);
                            setFieldValue('qualityProfileId', null);
                            setFieldValue('rootFolder', '');
                            setFieldValue('tags', []);
                            setFieldValue('languageProfileId', null);
                            setIsValidated(false);
                            return;
                          }
                          const [type, idStr] = val.split('-');
                          const id = Number(idStr);
                          setFieldValue('serviceId', id);
                          setFieldValue('qualityProfileId', null);
                          setFieldValue('rootFolder', '');
                          setFieldValue('tags', []);
                          setFieldValue('languageProfileId', null);
                          const serviceList =
                            type === 'radarr' ? radarrServices : sonarrServices;
                          const match = serviceList.find((s) => s.id === id);
                          if (match) {
                            getServiceInfos(match, type as 'radarr' | 'sonarr');
                          }
                        }}
                      >
                        <option value="">
                          {intl.formatMessage(messages.selectService)}
                        </option>
                        {radarrServices.map((radarr) => (
                          <option
                            key={`radarr-${radarr.id}`}
                            value={`radarr-${radarr.id}`}
                          >
                            {radarr.name}
                          </option>
                        ))}
                        {sonarrServices.map((sonarr) => (
                          <option
                            key={`sonarr-${sonarr.id}`}
                            value={`sonarr-${sonarr.id}`}
                          >
                            {sonarr.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <label htmlFor="qualityProfileId" className="text-label">
                    {intl.formatMessage(messages.qualityprofile)}
                  </label>
                  <div className="form-input-area">
                    <div className="form-input-field">
                      <Field
                        as="select"
                        id="qualityProfileId"
                        name="qualityProfileId"
                        disabled={!isValidated || isTesting}
                      >
                        <option value="">
                          {intl.formatMessage(messages.selectQualityProfile)}
                        </option>
                        {testResponse.profiles.map((p) => (
                          <option key={`profile-${p.id}`} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </Field>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <label htmlFor="rootFolder" className="text-label">
                    {intl.formatMessage(messages.rootfolder)}
                  </label>
                  <div className="form-input-area">
                    <div className="form-input-field">
                      <Field
                        as="select"
                        id="rootFolder"
                        name="rootFolder"
                        disabled={!isValidated || isTesting}
                      >
                        <option value="">
                          {intl.formatMessage(messages.selectRootFolder)}
                        </option>
                        {testResponse.rootFolders.map((folder) => (
                          <option key={`folder-${folder.id}`} value={folder.path}>
                            {folder.path}
                          </option>
                        ))}
                      </Field>
                    </div>
                  </div>
                </div>

                {testResponse.isSonarr &&
                  testResponse.languageProfiles &&
                  testResponse.languageProfiles.length > 0 && (
                    <div className="form-row">
                      <label htmlFor="languageProfileId" className="text-label">
                        {intl.formatMessage(messages.languageprofile)}
                      </label>
                      <div className="form-input-area">
                        <div className="form-input-field">
                          <Field
                            as="select"
                            id="languageProfileId"
                            name="languageProfileId"
                            disabled={!isValidated || isTesting}
                          >
                            <option value="">
                              {intl.formatMessage(messages.selectLanguageProfile)}
                            </option>
                            {testResponse.languageProfiles.map((lp) => (
                              <option key={`lp-${lp.id}`} value={lp.id}>
                                {lp.name}
                              </option>
                            ))}
                          </Field>
                        </div>
                      </div>
                    </div>
                  )}

                <div className="form-row">
                  <label htmlFor="tags" className="text-label">
                    {intl.formatMessage(messages.tags)}
                  </label>
                  <div className="form-input-area">
                    <Select<OptionType, true>
                      options={testResponse.tags.map((tag) => ({
                        label: tag.label,
                        value: tag.id,
                      }))}
                      isMulti
                      isDisabled={!isValidated || isTesting}
                      placeholder={intl.formatMessage(messages.selecttags)}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      value={values.tags
                        .map((tagId) => {
                          const found = testResponse.tags.find(
                            (t) => t.id === tagId
                          );
                          if (!found) return undefined;
                          return { value: found.id, label: found.label };
                        })
                        .filter((o): o is OptionType => o !== undefined)}
                      onChange={(value) => {
                        setFieldValue(
                          'tags',
                          value.map((option) => option.value)
                        );
                      }}
                      noOptionsMessage={() =>
                        intl.formatMessage(messages.notagoptions)
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <label htmlFor="enabled" className="text-label">
                    {intl.formatMessage(messages.enabled)}
                  </label>
                  <div className="form-input-area">
                    <Field
                      type="checkbox"
                      id="enabled"
                      name="enabled"
                      checked={values.enabled}
                      onChange={() => setFieldValue('enabled', !values.enabled)}
                    />
                  </div>
                </div>
              </div>
            </Modal>
          );
        }}
      </Formik>
    </Transition>
  );
};

export default RequestProfileModal;
