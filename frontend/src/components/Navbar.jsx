import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';

const Navbar = () => {
  return (
    <div>
      {/* Add this to your navigation items */}
      <Button
        color="inherit"
        component={Link}
        to="/approved-rooms"
      >
        Approved Rooms
      </Button>
    </div>
  );
};

export default Navbar; 