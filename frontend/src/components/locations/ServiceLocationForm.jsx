import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Paper,
  Container,
  Autocomplete
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateServiceLocation, useUpdateServiceLocation, useServiceLocation } from '../../hooks/useServiceLocations';
import { getOrganizations } from '../../api/organizations';
import { debounce } from 'lodash';

const ServiceLocationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mutate: createLocation } = useCreateServiceLocation();
  const { mutate: updateLocation } = useUpdateServiceLocation();
  const { data: existingLocation } = useServiceLocation(id);

  const [organizations, setOrganizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState(null);

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      version: 1,
      organizationId: '',
      organizationName: '',
      name: '',
      npiNumber: '',
      placeOfService: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      fax: '',
      active: true,
      interpretersCanAcceptAppts: true,
      locationCreatedApptDontRequireConfirmation: false,
      appointmentConfirmation: '',
      emailConfirmationFormat: '',
      sendConfirmationTo: ''
    }
  });

  // Fetch organizations when search term changes
  const debouncedFetchOrganizations = debounce(async (search) => {
    try {
      const data = await getOrganizations(search);
      setOrganizations(data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  }, 300);

  useEffect(() => {
    if (searchTerm) {
      debouncedFetchOrganizations(searchTerm);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (existingLocation) {
      Object.entries(existingLocation).forEach(([key, value]) => {
        setValue(key, value);
      });
      setSelectedOrg({
        id: existingLocation.organizationId,
        name: existingLocation.organizationName
      });
    }
  }, [existingLocation, setValue]);

  const onSubmit = async (data) => {
    try {
      const formData = {
        ...data,
        organizationId: selectedOrg?.id,
        organizationName: selectedOrg?.name
      };

      if (id) {
        await updateLocation({ id, ...formData });
      } else {
        await createLocation(formData);
      }
      navigate('/locations');
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {id ? 'Edit Service Location' : 'Create New Service Location'}
        </Typography>
        <Paper sx={{ p: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="organizationName"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      value={selectedOrg}
                      onChange={(event, newValue) => {
                        setSelectedOrg(newValue);
                      }}
                      onInputChange={(event, newInputValue) => {
                        setSearchTerm(newInputValue);
                      }}
                      options={organizations}
                      getOptionLabel={(option) => option.name || ''}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          {...field}
                          label="Organization"
                          fullWidth
                          required
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Location Name"
                      fullWidth
                      required
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="addressLine1"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Address Line 1"
                      fullWidth
                      required
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="addressLine2"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Address Line 2"
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="city"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="City"
                      fullWidth
                      required
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="state"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="State"
                      fullWidth
                      required
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="zip"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="ZIP Code"
                      fullWidth
                      required
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Phone"
                      fullWidth
                      required
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="fax"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Fax"
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="active"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="Active"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="interpretersCanAcceptAppts"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="Interpreters Can Accept Appointments"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="locationCreatedApptDontRequireConfirmation"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="Location Created Appointments Don't Require Confirmation"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="appointmentConfirmation"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Appointment Confirmation"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/locations')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                {id ? 'Update' : 'Create'} Location
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ServiceLocationForm;
