import * as React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { fixtures } from '@strapi/admin-test-utils';
import { lightTheme, ThemeProvider } from '@strapi/design-system';
import { NotificationsProvider, RBACContext } from '@strapi/helper-plugin';
import { fireEvent, render as renderRTL, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

// @ts-expect-error - js file
import { server } from '../../../../tests/server';
import { api } from '../../services/api';
import { SettingsPage } from '../Settings';

const render = ({ permissions } = { permissions: fixtures.permissions.allPermissions }) => ({
  ...renderRTL(<SettingsPage />, {
    wrapper({ children }) {
      const client = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const rbacContextValue = React.useMemo(
        () => ({
          allPermissions: permissions,
        }),
        []
      ) as any;

      const store = configureStore({
        preloadedState: {
          admin_app: { permissions: fixtures.permissions.app },
          rbacProvider: {
            allPermissions: [...fixtures.permissions.allPermissions],
          },
        },
        reducer: {
          [api.reducerPath]: api.reducer,
          admin_app: (state = {}) => state,
          rbacProvider: (state = {}) => state,
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware({
            immutableCheck: false,
            serializableCheck: false,
          }).concat(api.middleware),
      });

      return (
        <Provider store={store}>
          <MemoryRouter>
            <ThemeProvider theme={lightTheme}>
              <QueryClientProvider client={client}>
                <IntlProvider locale="en" messages={{}} textComponent="span">
                  <NotificationsProvider>
                    <RBACContext.Provider value={rbacContextValue}>{children}</RBACContext.Provider>
                  </NotificationsProvider>
                </IntlProvider>
              </QueryClientProvider>
            </ThemeProvider>
          </MemoryRouter>
        </Provider>
      );
    },
  }),
  user: userEvent.setup(),
});

describe('SettingsPage', () => {
  it('renders the setting page correctly', async () => {
    const { getByRole, queryByText, getByText } = render();

    await waitFor(() => expect(queryByText('Loading content.')).not.toBeInTheDocument());

    expect(getByRole('heading', { name: 'Documentation' })).toBeInTheDocument();
    expect(getByText('Configure the documentation plugin')).toBeInTheDocument();
    expect(getByRole('heading', { name: 'Settings' })).toBeInTheDocument();

    expect(getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Save' })).toHaveAttribute('aria-disabled', 'true');

    expect(getByRole('checkbox', { name: 'Restricted Access' })).toBeInTheDocument();
  });

  it('should automatically render the password field if the server restricted access property is true', async () => {
    server.use(
      rest.get('*/getInfos', (req, res, ctx) => {
        return res(
          ctx.json({
            documentationAccess: { restrictedAccess: true },
          })
        );
      })
    );

    const { getByLabelText, queryByText } = render();

    await waitFor(() => expect(queryByText('Loading content.')).not.toBeInTheDocument());

    expect(getByLabelText('Password')).toBeInTheDocument();

    server.restoreHandlers();
  });

  it('should render the password field when the Restricted Access checkbox is checked', async () => {
    const { getByRole, getByLabelText, queryByText } = render();

    await waitFor(() => expect(queryByText('Loading content.')).not.toBeInTheDocument());

    fireEvent.click(getByRole('checkbox', { name: 'Restricted Access' }));

    expect(getByRole('button', { name: 'Save' })).toHaveAttribute('aria-disabled', 'false');

    expect(getByLabelText('Password')).toBeInTheDocument();
  });

  it('should allow me to type a password and save that settings change successfully', async () => {
    const { getByRole, getByLabelText, queryByText, user, findByText } = render();

    await waitFor(() => expect(queryByText('Loading content.')).not.toBeInTheDocument());

    fireEvent.click(getByRole('checkbox', { name: 'Restricted Access' }));

    expect(getByRole('button', { name: 'Save' })).toHaveAttribute('aria-disabled', 'false');

    await user.type(getByLabelText('Password'), 'password');

    fireEvent.click(getByRole('button', { name: 'Save' }));

    await findByText('Successfully updated settings');
  });
});
