"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Box,
  Container,
  Typography,
} from "@mui/material"

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  console.log(session)
  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/api/auth/signin")
      return
    }

    if ((session.user as any)?.role !== "admin") {
      router.push("/")
      return
    }

    setIsLoading(false)
  }, [session, status, router])

  if (isLoading) {
    return (
      <Box sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography variant="h6">Загрузка...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 64px)',
      py: 4
    }}>
      <Container maxWidth="xl">
        <Typography>Admin</Typography>
      </Container>
    </Box>
  )
} 