import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useFieldConfig } from '../hooks/useFieldConfig';

const FieldConfigTable = () => {
  const [editingField, setEditingField] = useState(null);
  const [editData, setEditData] = useState({});
  
  const {
    fields,
    isLoading,
    error,
    updateField
  } = useFieldConfig();

  const handleEdit = (field) => {
    setEditingField(field._id);
    setEditData({ ...field });
  };

  const handleSave = async (id) => {
    try {
      await updateField({ id, data: editData });
      setEditingField(null);
      setEditData({});
    } catch (error) {
      console.error('Error updating field configuration:', error);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditData({});
  };

  const handleChange = (field, key, value) => {
    if (editingField === field._id) {
      setEditData({ ...editData, [key]: value });
    } else {
      // For checkboxes that don't require edit mode
      updateField({ id: field._id, data: { [key]: value } });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading field configurations: {error.message}
      </Alert>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 950 }}>
        <TableHead>
          <TableRow>
            <TableCell>Use</TableCell>
            <TableCell>Required</TableCell>
            <TableCell>Field Name</TableCell>
            <TableCell>Display Label</TableCell>
            <TableCell>Input Placeholder</TableCell>
            <TableCell>Default Rule</TableCell>
            <TableCell>Custom Rule</TableCell>
            <TableCell>Default Message</TableCell>
            <TableCell>Custom Message</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fields?.map((field) => (
            <TableRow key={field._id}>
              <TableCell>
                <Checkbox
                  checked={editingField === field._id ? editData.inUse : field.inUse}
                  onChange={(e) => handleChange(field, 'inUse', e.target.checked)}
                />
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={editingField === field._id ? editData.required : field.required}
                  onChange={(e) => handleChange(field, 'required', e.target.checked)}
                />
              </TableCell>
              <TableCell>{field.fieldName}</TableCell>
              <TableCell>
                {editingField === field._id ? (
                  <TextField
                    value={editData.displayLabel}
                    onChange={(e) => handleChange(field, 'displayLabel', e.target.value)}
                  />
                ) : (
                  field.displayLabel
                )}
              </TableCell>
              <TableCell>
                {editingField === field._id ? (
                  <TextField
                    value={editData.inputPlaceholder}
                    onChange={(e) => handleChange(field, 'inputPlaceholder', e.target.value)}
                  />
                ) : (
                  field.inputPlaceholder
                )}
              </TableCell>
              <TableCell>{field.defaultRule}</TableCell>
              <TableCell>
                {editingField === field._id ? (
                  <TextField
                    value={editData.customRule || ''}
                    onChange={(e) => handleChange(field, 'customRule', e.target.value)}
                  />
                ) : (
                  field.customRule
                )}
              </TableCell>
              <TableCell>{field.defaultMessage}</TableCell>
              <TableCell>
                {editingField === field._id ? (
                  <TextField
                    value={editData.customMessage || ''}
                    onChange={(e) => handleChange(field, 'customMessage', e.target.value)}
                  />
                ) : (
                  field.customMessage
                )}
              </TableCell>
              <TableCell>
                {editingField === field._id ? (
                  <>
                    <Tooltip title="Save">
                      <IconButton onClick={() => handleSave(field._id)} color="primary">
                        <SaveIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancel">
                      <IconButton onClick={handleCancel} color="error">
                        <CancelIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(field)} color="primary">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FieldConfigTable;
