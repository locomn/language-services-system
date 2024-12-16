import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    FormControlLabel,
    Grid,
    Paper,
    Switch,
    TextField,
    Typography,
    Divider
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import SiteList from '../sites/SiteList';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const OrganizationForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [organization, setOrganization] = useState({
        name: '',
        useSites: false,
        active: true
    });

    // Load existing organization if editing
    useEffect(() => {
        if (id) {
            const fetchOrganization = async () => {
                try {
                    const response = await axios.get(`${API_URL}/organizations/${id}`);
                    setOrganization(response.data);
                } catch (error) {
                    console.error('Error fetching organization:', error);
                }
            };
            fetchOrganization();
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await axios.put(`${API_URL}/organizations/${id}`, organization);
                navigate('/organizations');
            } else {
                const response = await axios.post(`${API_URL}/organizations`, organization);
                if (organization.useSites) {
                    navigate(`/organizations/${response.data._id}/edit`);
                } else {
                    navigate('/organizations');
                }
            }
        } catch (error) {
            console.error('Error saving organization:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {id ? 'Edit Organization' : 'Create Organization'}
                </Typography>

                <Paper sx={{ p: 4, mb: 4 }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Organization Name"
                                    value={organization.name}
                                    onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
                                    fullWidth
                                    required
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={organization.useSites}
                                            onChange={(e) => setOrganization({ ...organization, useSites: e.target.checked })}
                                        />
                                    }
                                    label="Use Sites for this Organization"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={organization.active}
                                            onChange={(e) => setOrganization({ ...organization, active: e.target.checked })}
                                        />
                                    }
                                    label="Active"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate('/organizations')}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : (id ? 'Update' : 'Create')}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>

                {id && organization.useSites && (
                    <>
                        <Divider sx={{ my: 4 }} />
                        <SiteList organizationId={id} />
                    </>
                )}
            </Box>
        </Container>
    );
};

export default OrganizationForm;
