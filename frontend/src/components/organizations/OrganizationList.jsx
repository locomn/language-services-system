import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
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
    Chip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const OrganizationList = () => {
    const navigate = useNavigate();
    const [organizations, setOrganizations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchOrganizations = async () => {
        try {
            const response = await axios.get(`${API_URL}/organizations`, {
                params: { search: searchTerm }
            });
            setOrganizations(response.data);
        } catch (error) {
            console.error('Error fetching organizations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, [searchTerm]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this organization?')) {
            try {
                await axios.delete(`${API_URL}/organizations/${id}`);
                fetchOrganizations();
            } catch (error) {
                console.error('Error deleting organization:', error);
            }
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Organizations
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/organizations/new')}
                    >
                        Add Organization
                    </Button>
                </Box>

                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search organizations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 3 }}
                />

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Structure</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {organizations.map((org) => (
                                <TableRow key={org._id}>
                                    <TableCell>{org.name}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={org.active ? 'Active' : 'Inactive'}
                                            color={org.active ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {org.hasHierarchy ? (
                                            <Box>
                                                {org.hasSites && org.hasBuildings ? (
                                                    'Sites & Buildings'
                                                ) : org.hasSites ? (
                                                    'Sites Only'
                                                ) : (
                                                    'Simple'
                                                )}
                                            </Box>
                                        ) : (
                                            'Simple'
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            onClick={() => navigate(`/organizations/${org._id}/edit`)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(org._id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {organizations.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        No organizations found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Container>
    );
};

export default OrganizationList;
