import { InitColorSchemeScript } from '@mui/material';
import React from 'react';
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import Providers from './components/Providers';
import AppToolbar from './components/AppTollbar';

export default function RootLayout(props: { children: React.ReactNode })
{
  return (
    <html lang="en">
    <body>
    <InitColorSchemeScript attribute="class"/>
    <AppRouterCacheProvider options={{enableCssLayer: true}}>
      <Providers>
        <AppToolbar />
        {props.children}
      </Providers>
    </AppRouterCacheProvider>
    </body>
    </html>
  )
}