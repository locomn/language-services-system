import React, { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  TextField,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useServiceLocations, useDeleteServiceLocation } from '../../hooks/useServiceLocations';

const ServiceLocationList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);
  
  const { data: locations = [], isLoading } = useServiceLocations({ search: debouncedTerm });
  const deleteLocation = useDeleteServiceLocation();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((term) => {
      setDebouncedTerm(term);
    }, 300),
    []
  );

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleDeleteClick = (location) => {
    setLocationToDelete(location);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (locationToDelete) {
      await deleteLocation.mutateAsync(locationToDelete._id);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          label="Search locations"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: '300px' }}
          autoComplete="off"
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/locations/new')}
        >
          Add Location
        </Button>
      </Box>

      <Grid container spacing={3}>
        {locations.map((location) => (
          <Grid item xs={12} sm={6} md={4} key={location._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" component="div">
                      {location.name}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {location.categoryName}
                    </Typography>
                  </Box>
                  <Box>
                    <Chip
                      label={location.active ? 'Active' : 'Inactive'}
                      color={location.active ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon sx={{ mr: 1, fontSize: 'small' }} color="action" />
                  <Typography variant="body2">
                    {location.addressLine1}
                    {location.addressLine2 && `, ${location.addressLine2}`}
                    <br />
                    {location.city}, {location.state} {location.zip}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon sx={{ mr: 1, fontSize: 'small' }} color="action" />
                  <Typography variant="body2">
                    {location.phone}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/locations/${location._id}/edit`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(location)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Location</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {locationToDelete?.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServiceLocationList;
