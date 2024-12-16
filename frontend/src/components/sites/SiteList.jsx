import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Switch,
    FormControlLabel
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Business as BusinessIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SiteList = ({ organizationId }) => {
    const navigate = useNavigate();
    const [sites, setSites] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedSite, setSelectedSite] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        active: true,
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        fax: ''
    });

    const fetchSites = async () => {
        try {
            const response = await axios.get(`${API_URL}/organizations/${organizationId}/sites`);
            setSites(response.data);
        } catch (error) {
            console.error('Error fetching sites:', error);
        }
    };

    useEffect(() => {
        if (organizationId) {
            fetchSites();
        }
    }, [organizationId]);

    const handleOpenDialog = (site = null) => {
        if (site) {
            setSelectedSite(site);
            setFormData(site);
        } else {
            setSelectedSite(null);
            setFormData({
                name: '',
                active: true,
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                zip: '',
                phone: '',
                fax: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedSite(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedSite) {
                await axios.put(`${API_URL}/organizations/${organizationId}/sites/${selectedSite._id}`, formData);
            } else {
                await axios.post(`${API_URL}/organizations/${organizationId}/sites`, formData);
            }
            fetchSites();
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving site:', error);
        }
    };

    const handleDelete = async (siteId) => {
        if (window.confirm('Are you sure you want to delete this site?')) {
            try {
                await axios.delete(`${API_URL}/organizations/${organizationId}/sites/${siteId}`);
                fetchSites();
            } catch (error) {
                console.error('Error deleting site:', error);
            }
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" component="h2">
                    Sites
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Site
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Buildings</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sites.map((site) => (
                            <TableRow key={site._id}>
                                <TableCell>{site.name}</TableCell>
                                <TableCell>
                                    <Switch
                                        checked={site.active}
                                        onChange={async (e) => {
                                            try {
                                                await axios.put(`${API_URL}/organizations/${organizationId}/sites/${site._id}`, {
                                                    ...site,
                                                    active: e.target.checked
                                                });
                                                fetchSites();
                                            } catch (error) {
                                                console.error('Error updating site status:', error);
                                            }
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    {site.addressLine1}<br />
                                    {site.addressLine2 && <>{site.addressLine2}<br /></>}
                                    {site.city}, {site.state} {site.zip}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        startIcon={<BusinessIcon />}
                                        onClick={() => navigate(`/organizations/${organizationId}/sites/${site._id}/buildings`)}
                                    >
                                        View Buildings
                                    </Button>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleOpenDialog(site)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(site._id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedSite ? 'Edit Site' : 'Add Site'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Site Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    />
                                }
                                label="Active"
                            />
                            <TextField
                                label="Address Line 1"
                                value={formData.addressLine1}
                                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                                required
                            />
                            <TextField
                                label="Address Line 2"
                                value={formData.addressLine2}
                                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                            />
                            <TextField
                                label="City"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                required
                            />
                            <TextField
                                label="State"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                required
                            />
                            <TextField
                                label="ZIP Code"
                                value={formData.zip}
                                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                                required
                            />
                            <TextField
                                label="Phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <TextField
                                label="Fax"
                                value={formData.fax}
                                onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary">
                            {selectedSite ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default SiteList;
