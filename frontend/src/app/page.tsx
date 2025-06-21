import {
  Box,
  Typography,
} from '@mui/material'


export default function Page() {
  return (
    <Box sx={{
      minHeight: 'calc(100vh - 64px)', py: 4
    }}>
      <Typography>
        Service
      </Typography>
    </Box>
  )
}