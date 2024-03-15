import * as React from 'react';

import { Main } from '@strapi/design-system';
import { useFocusWhenNavigate, useNotification, useAPIErrorHandler } from '@strapi/helper-plugin';
import { Page } from '@strapi/strapi/admin';

import { SettingsForm } from '../components/SettingsForm';
import { useGetInfosQuery, useUpdateSettingsMutation } from '../services/api';
import { getTrad } from '../utils';

const SettingsPage = () => {
  useFocusWhenNavigate();
  const toggleNotification = useNotification();
  const { formatAPIError } = useAPIErrorHandler();
  const { data, isError, isLoading } = useGetInfosQuery();
  const [updateSettings] = useUpdateSettingsMutation();

  const onUpdateSettings = async (body: any) => {
    return updateSettings({ body })
      .unwrap()
      .then(() => {
        toggleNotification({
          type: 'success',
          message: {
            id: getTrad('notification.update.success'),
            defaultMessage: 'Successfully updated settings',
          },
        });
      })
      .catch((err) => {
        toggleNotification({
          type: 'warning',
          message: formatAPIError(err),
        });
      });
  };

  if (isLoading) {
    return <Page.Loading />;
  }

  if (isError) {
    return <Page.Error />;
  }

  return (
    <Main>
      <SettingsForm data={data} onSubmit={onUpdateSettings} />
    </Main>
  );
};

export { SettingsPage };
