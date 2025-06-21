"use client"

import {
  Autocomplete,
  Box,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useSession } from 'next-auth/react'
import { SyntheticEvent, useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'

interface User {
  id: string
  name: string
  email: string
}

interface Log {
  id: string
  original_text: string
  algorithm: string
  hashed_text: string
  created_at: string
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<readonly User[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [logs, setLogs] = useState<Log[]>([])
  const [logsLoading, setLogsLoading] = useState(false)

  useEffect(() => {
    if (debouncedSearchTerm || open) {
      setLoading(true)
      fetch(`${process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001'}/api/admin/users?search=${debouncedSearchTerm}`, {
        headers: { 'x-user-email': session?.user?.email || '' },
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            console.error(data.error)
            setOptions([])
          } else {
            setOptions(data)
          }
        })
        .finally(() => setLoading(false))
    }
  }, [debouncedSearchTerm, open, session])

  useEffect(() => {
    if (selectedUser) {
      setLogsLoading(true)
      fetch(`${process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001'}/api/admin/logs/${selectedUser.id}`, {
        headers: { 'x-user-email': session?.user?.email || '' },
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            console.error(data.error)
            setLogs([])
          } else {
            setLogs(data)
          }
        })
        .finally(() => setLogsLoading(false))
    }
  }, [selectedUser, session])


  if (status === 'loading') {
    return <Typography>Загрузка...</Typography>
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return <Typography>Доступ запрещен.</Typography>
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Админ-панель</Typography>
      <Stack spacing={2}>
        <Autocomplete
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          onChange={(event: SyntheticEvent, value: User | null) => setSelectedUser(value)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          getOptionLabel={(option) => `${option.name} (${option.email})`}
          options={options}
          loading={loading}
          onInputChange={(event, newInputValue) => {
            setSearchTerm(newInputValue)
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Поиск пользователя по имени или email"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" size={20}/> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        {logsLoading && <CircularProgress/>}
        {!logsLoading && logs.length > 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Исходный текст</TableCell>
                  <TableCell>Алгоритм</TableCell>
                  <TableCell>Хэш</TableCell>
                  <TableCell>Дата</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.original_text}</TableCell>
                    <TableCell>{log.algorithm}</TableCell>
                    <TableCell sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>{log.hashed_text}</TableCell>
                    <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {!logsLoading && logs.length === 0 && selectedUser && (
          <Typography>У этого пользователя нет логов.</Typography>
        )}
      </Stack>
    </Box>
  )
} 