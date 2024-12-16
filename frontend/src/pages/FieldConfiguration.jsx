import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import FieldConfigTable from '../components/FieldConfigTable';

const FieldConfiguration = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Field Configuration
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Configure form fields, validation rules, and display options for your language services system.
        </Typography>
        <Paper elevation={3} sx={{ p: 2 }}>
          <FieldConfigTable />
        </Paper>
      </Box>
    </Container>
  );
};

export default FieldConfiguration;
