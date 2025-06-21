'use client'

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useSession } from 'next-auth/react'


export default function Page() {
  const { data: session, status } = useSession()
  const [text, setText] = useState('')
  const [algorithm, setAlgorithm] = useState('md5')
  const [hashedText, setHashedText] = useState('')
  const [error, setError] = useState('')

  const handleHash = async () => {
    if (!session?.user?.email) {
      setError('Не удалось получить email из сессии. Попробуйте войти снова.')
      return
    }
    setError('')
    setHashedText('')
    try {
      const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001'}/api/hash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': session.user.email,
        },
        body: JSON.stringify({ text, algorithm }),
      })
      const data = await response.json()
      if (response.ok) {
        setHashedText(data.hashedText)
      } else {
        setError(data.error || 'Произошла ошибка')
      }
    } catch (err) {
      console.error('Ошибка при хэшировании:', err)
      setError('Ошибка сети или сервера.')
    }
  }


  return (
    <Box sx={{
      minHeight: 'calc(100vh - 64px)',
      py: 4,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
    }}>
      <Typography variant="h4">
        Сервис для хэширования
      </Typography>

      {status === 'loading' && <Typography>Загрузка сессии...</Typography>}

      {status === 'unauthenticated' && <Typography>Авторизуйтесь</Typography>}

      {status === 'authenticated' && (
      <Stack spacing={2} sx={{ width: '100%', maxWidth: '500px' }}>
        <TextField
          label="Текст для хэширования"
          value={text}
          onChange={(e) => setText(e.target.value)}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel id="algorithm-select-label">Алгоритм</InputLabel>
          <Select
            labelId="algorithm-select-label"
            value={algorithm}
            label="Алгоритм"
            onChange={(e: SelectChangeEvent) => setAlgorithm(e.target.value)}
          >
            <MenuItem value="md5">MD5</MenuItem>
            <MenuItem value="sha1">SHA1</MenuItem>
            <MenuItem value="sha256">SHA256</MenuItem>
          </Select>
        </FormControl>
        <Button onClick={handleHash} variant="contained" size="large">Хэшировать</Button>
      </Stack>
      )}


      {hashedText && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 1, width: '100%', maxWidth: '500px' }}>
          <Typography variant="h6">Результат:</Typography>
          <Typography sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>{hashedText}</Typography>
        </Box>
      )}
      {error && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'error.main', borderRadius: 1, width: '100%', maxWidth: '500px' }}>
          <Typography variant="h6" color="error">Ошибка:</Typography>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
    </Box>
  )
}