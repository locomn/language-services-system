import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
    Box,
    Drawer,
    List,
    ListItem,
    Typography,
    Divider
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import TranslateIcon from '@mui/icons-material/Translate';
import BusinessIcon from '@mui/icons-material/Business';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

// Components
import ServiceLocationList from '../locations/ServiceLocationList';
import OrganizationList from '../organizations/OrganizationList';

const DRAWER_WIDTH = 100;

const menuItems = [
    {
        text: 'Me',
        path: '/me',
        icon: <AccountCircleIcon sx={{ 
            color: '#ffffff'
        }} />,
        bgColor: '#007AFF'
    },
    {
        text: 'Appointment',
        path: '/appointments',
        icon: <CalendarMonthIcon sx={{ 
            color: '#ffffff'
        }} />,
        bgColor: '#34C759'
    },
    {
        text: 'Client',
        path: '/clients',
        icon: <GroupsIcon sx={{ 
            color: '#ffffff'
        }} />,
        bgColor: '#5E5CE6'
    },
    {
        text: 'Location',
        path: '/locations',
        icon: <LocationCityIcon sx={{ 
            color: '#ffffff'
        }} />,
        bgColor: '#FF9F0A'
    },
    {
        text: 'Interpreter',
        path: '/interpreters',
        icon: <TranslateIcon sx={{ 
            color: '#ffffff'
        }} />,
        bgColor: '#FF375F'
    },
    {
        text: 'System',
        path: '/system',
        icon: <BusinessIcon sx={{ 
            color: '#ffffff'
        }} />,
        bgColor: '#32ADE6'
    }
];

const AppLayout = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        backgroundColor: '#f5f5f7',
                        border: 'none',
                        borderRight: '1px solid rgba(0,0,0,0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '0'
                    },
                }}
            >
                {/* Logo */}
                <Box sx={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                    marginBottom: '24px'
                }}>
                    <Box
                        sx={{
                            width: 150,
                            height: 60,
                            borderRadius: '8px',
                            border: '2px dashed rgba(0,0,0,0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'rgba(0,0,0,0.5)',
                            fontSize: '0.9rem',
                            background: '#f8f8f8'
                        }}
                    >
                        Company Logo
                    </Box>
                </Box>
                <List sx={{ 
                    width: '100%', 
                    padding: '8px 0',
                    backgroundColor: '#f5f5f7',
                    flexGrow: 1
                }}>
                    {menuItems.map((item) => (
                        <ListItem
                            key={item.text}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '12px 0',
                                cursor: 'pointer',
                                '&:hover': {
                                    '& .MuiTypography-root': {
                                        opacity: 0.7
                                    },
                                    '& .icon-container': {
                                        opacity: 0.7
                                    }
                                },
                            }}
                            onClick={() => navigate(item.path)}
                        >
                            <Box
                                className="icon-container"
                                sx={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '12px',
                                    backgroundColor: item.bgColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'opacity 0.2s ease',
                                    '& .MuiSvgIcon-root': {
                                        fontSize: '1.8rem',
                                    }
                                }}
                            >
                                {item.icon}
                            </Box>
                            <Typography 
                                variant="body2"
                                sx={{
                                    marginTop: '10px',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    color: 'rgba(0,0,0,0.8)',
                                    letterSpacing: '-0.01em'
                                }}
                            >
                                {item.text}
                            </Typography>
                        </ListItem>
                    ))}
                </List>
                <Divider sx={{ width: '100%' }} />
                <List sx={{ width: '100%', padding: '8px 0' }}>
                    <ListItem
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '12px 0',
                            cursor: 'pointer',
                            '&:hover': {
                                '& .MuiTypography-root': {
                                    opacity: 0.7
                                },
                                '& .icon-container': {
                                    opacity: 0.7
                                }
                            },
                        }}
                        onClick={() => navigate('/logout')}
                    >
                        <Box
                            className="icon-container"
                            sx={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '12px',
                                backgroundColor: '#FF3B30',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'opacity 0.2s ease',
                                '& .MuiSvgIcon-root': {
                                    fontSize: '1.8rem',
                                    color: '#ffffff'
                                }
                            }}
                        >
                            <LogoutIcon />
                        </Box>
                        <Typography 
                            variant="body2"
                            sx={{
                                marginTop: '10px',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                color: 'rgba(0,0,0,0.8)',
                                letterSpacing: '-0.01em'
                            }}
                        >
                            Logout
                        </Typography>
                    </ListItem>
                </List>
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Routes>
                    <Route path="/" element={<ServiceLocationList />} />
                    <Route path="/organizations" element={<OrganizationList />} />
                    <Route path="/appointments" element={<div>Appointments (Coming Soon)</div>} />
                    <Route path="/clients" element={<div>Clients (Coming Soon)</div>} />
                    <Route path="/locations" element={<ServiceLocationList />} />
                    <Route path="/interpreters" element={<div>Interpreters (Coming Soon)</div>} />
                    <Route path="/system" element={<div>System (Coming Soon)</div>} />
                    <Route path="/me" element={<div>Me (Coming Soon)</div>} />
                    <Route path="/logout" element={<div>Logout (Coming Soon)</div>} />
                </Routes>
            </Box>
        </Box>
    );
};

export default AppLayout;
