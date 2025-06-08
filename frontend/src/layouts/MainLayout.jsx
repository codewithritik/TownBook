import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Divider,
  Stack,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Home as HomeIcon,
  Book as BookIcon,
  MeetingRoom as RoomIcon,
  CalendarToday as ReservationIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  CalendarMonth as CalendarIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";

const drawerWidth = 240;

const MainLayout = () => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuItems = [
    ...(user?.role === "librarian"
      ? [{ text: "Admin Dashboard", icon: <AdminIcon sx={{ color: 'white' }} />, path: "/admin" }]
      : [
          { text: "Home", icon: <HomeIcon sx={{ color: 'white' }} />, path: "/home" },
          { text: "Books", icon: <BookIcon sx={{ color: 'white' }} />, path: "/books" },
          { text: "Rooms", icon: <RoomIcon sx={{ color: 'white' }} />, path: "/rooms" },
          {
            text: "Reservations",
            icon: <CalendarIcon sx={{ color: 'white' }} />,
            path: "/reservations",
          }
        ]),
  ];

  const drawer = (
    <div>
      <Toolbar></Toolbar>
      <List></List>
    </div>
  );

  return (
    <Box sx={{ display: "flex",  width: '99vw', }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        color='primary'
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 3,
          backgroundColor: "#008D86",
        }}
      >
        <Stack direction="row" spacing={2}>
          <ListItem>
            <Typography variant="h5" noWrap component="div" color="white">
              TownBook App
            </Typography>
          </ListItem>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setOpen(false);
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
              <Divider />
            </ListItem>
          ))}
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar>{user?.name?.[0]?.toUpperCase()}</Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
            >
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Toolbar>
        </Stack>
      </AppBar>
     
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          p: "20px",
          mt: "44px",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
