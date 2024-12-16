import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useFieldConfig } from '../hooks/useFieldConfig';

const AuditTrail = () => {
  const { auditTrail, isAuditLoading, error } = useFieldConfig();

  if (isAuditLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading audit trail: {error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Audit Trail
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Field</TableCell>
              <TableCell>Change Type</TableCell>
              <TableCell>Previous Value</TableCell>
              <TableCell>New Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auditTrail?.map((log) => (
              <TableRow key={log._id}>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell>{log.fieldName}</TableCell>
                <TableCell>{log.changeType}</TableCell>
                <TableCell>{log.oldValue}</TableCell>
                <TableCell>{log.newValue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AuditTrail;
