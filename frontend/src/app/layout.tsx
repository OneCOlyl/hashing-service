import { CssBaseline, InitColorSchemeScript, ThemeProvider } from '@mui/material';
import React from 'react';
import theme from '../theme';
import ModeSwitch from "./components/ModeSwitch";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import Providers from './components/Providers';

export default function RootLayout(props: { children: React.ReactNode })
{
  return (
    <html lang="en">
    <body>
    <InitColorSchemeScript attribute="class"/>
    <AppRouterCacheProvider options={{enableCssLayer: true}}>
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <Providers>
          <ModeSwitch/>
          {props.children}
        </Providers>
      </ThemeProvider>
    </AppRouterCacheProvider>
    </body>
    </html>
  )
}