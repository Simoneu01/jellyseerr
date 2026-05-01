import type { RequestProfile } from '@server/lib/settings';
import { getSettings } from '@server/lib/settings';
import { Router } from 'express';

const requestProfileRoutes = Router();

requestProfileRoutes.get('/', (_req, res) => {
  const settings = getSettings();
  res.status(200).json(settings.requestProfiles);
});

requestProfileRoutes.post('/', async (req, res) => {
  const settings = getSettings();

  const newProfile = req.body as Omit<RequestProfile, 'id'>;
  const profiles = settings.requestProfiles;
  const lastItem = profiles[profiles.length - 1];
  const profileWithId: RequestProfile = {
    ...newProfile,
    id: lastItem ? lastItem.id + 1 : 0,
  };

  settings.requestProfiles = [...profiles, profileWithId];
  await settings.save();

  return res.status(201).json(profileWithId);
});

requestProfileRoutes.put<{ id: string }>(
  '/:id',
  async (req, res, next) => {
    const settings = getSettings();

    const profileIndex = settings.requestProfiles.findIndex(
      (p) => p.id === Number(req.params.id)
    );

    if (profileIndex === -1) {
      return next({ status: 404, message: 'Request profile not found' });
    }

    settings.requestProfiles[profileIndex] = {
      ...req.body,
      id: Number(req.params.id),
    } as RequestProfile;
    await settings.save();

    return res.status(200).json(settings.requestProfiles[profileIndex]);
  }
);

requestProfileRoutes.delete<{ id: string }>(
  '/:id',
  async (req, res, next) => {
    const settings = getSettings();

    const profileIndex = settings.requestProfiles.findIndex(
      (p) => p.id === Number(req.params.id)
    );

    if (profileIndex === -1) {
      return next({ status: 404, message: 'Request profile not found' });
    }

    const removed = settings.requestProfiles.splice(profileIndex, 1);
    await settings.save();

    return res.status(200).json(removed[0]);
  }
);

export default requestProfileRoutes;
