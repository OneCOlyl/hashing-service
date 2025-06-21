"use client"

import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  ThemeProvider,
  CssBaseline,
  Typography
} from "@mui/material";
import {
  AdminPanelSettings,
  Logout,
  EditNote
} from "@mui/icons-material";
import { useSession, signOut, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import theme from "../../theme";
import ModeSwitch from "./ModeSwitch";
import React, { useState, useEffect } from "react";
import { adminAPI } from "./AdminAPI";

function AppToolbar() {
  const {data: session} = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  console.log(session)
  
  const onClickToHashService = () => {
    router.push("/");
  };

  const onClickAdminPanel = () => {
    router.push("/admin");
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user?.email) {
        try {
          const response = await adminAPI.checkAdminStatus();
          if (response && response.isAdmin) {
            setIsAdmin(true);
          }
        } catch (err) {
          console.error(err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    };

    checkAdminStatus();
  }, [session]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
            Сервис для хъширования текста
          </Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
            <Button
              color="inherit"
              startIcon={<EditNote/>}
              onClick={onClickToHashService}
            >
              Хэширование
            </Button>
            
            {!isLoading && isAdmin && (
              <Button
                color="inherit"
                startIcon={<AdminPanelSettings/>}
                onClick={onClickAdminPanel}
              >
                Администрирование
              </Button>
            )}

            {session && (
              <IconButton color="inherit" onClick={() => signOut({callbackUrl: "/"})}>
                <Logout/>
              </IconButton>
            )}

            {!session && (
              <Button color="inherit" onClick={() => signIn()}>
                Войти
              </Button>
            )}
          </Box>
          <ModeSwitch/>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}

export default AppToolbar;