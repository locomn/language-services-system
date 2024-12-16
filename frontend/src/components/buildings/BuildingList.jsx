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
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BuildingList = () => {
    const { organizationId, siteId } = useParams();
    const [buildings, setBuildings] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedBuilding, setSelectedBuilding] = useState(null);
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

    const fetchBuildings = async () => {
        try {
            const response = await axios.get(`${API_URL}/organizations/${organizationId}/sites/${siteId}/buildings`);
            setBuildings(response.data);
        } catch (error) {
            console.error('Error fetching buildings:', error);
        }
    };

    useEffect(() => {
        if (organizationId && siteId) {
            fetchBuildings();
        }
    }, [organizationId, siteId]);

    const handleOpenDialog = (building = null) => {
        if (building) {
            setSelectedBuilding(building);
            setFormData(building);
        } else {
            setSelectedBuilding(null);
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
        setSelectedBuilding(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedBuilding) {
                await axios.put(
                    `${API_URL}/organizations/${organizationId}/sites/${siteId}/buildings/${selectedBuilding._id}`,
                    formData
                );
            } else {
                await axios.post(
                    `${API_URL}/organizations/${organizationId}/sites/${siteId}/buildings`,
                    formData
                );
            }
            fetchBuildings();
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving building:', error);
        }
    };

    const handleDelete = async (buildingId) => {
        if (window.confirm('Are you sure you want to delete this building?')) {
            try {
                await axios.delete(
                    `${API_URL}/organizations/${organizationId}/sites/${siteId}/buildings/${buildingId}`
                );
                fetchBuildings();
            } catch (error) {
                console.error('Error deleting building:', error);
            }
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" component="h2">
                    Buildings
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Building
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {buildings.map((building) => (
                            <TableRow key={building._id}>
                                <TableCell>{building.name}</TableCell>
                                <TableCell>
                                    <Switch
                                        checked={building.active}
                                        onChange={async (e) => {
                                            try {
                                                await axios.put(
                                                    `${API_URL}/organizations/${organizationId}/sites/${siteId}/buildings/${building._id}`,
                                                    {
                                                        ...building,
                                                        active: e.target.checked
                                                    }
                                                );
                                                fetchBuildings();
                                            } catch (error) {
                                                console.error('Error updating building status:', error);
                                            }
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    {building.addressLine1}<br />
                                    {building.addressLine2 && <>{building.addressLine2}<br /></>}
                                    {building.city}, {building.state} {building.zip}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleOpenDialog(building)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(building._id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedBuilding ? 'Edit Building' : 'Add Building'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Building Name"
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
                            {selectedBuilding ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default BuildingList;
