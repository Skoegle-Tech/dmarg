import { useEffect, useState } from "react";
import { useStore } from "../../Store/Store";
import {
  Grid,
  Box,
  CircularProgress,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Chip
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  PersonOutlined as PersonIcon
} from "@mui/icons-material";
import UserCard from "./UserCard";
import EmptyState from "./EmptyState";

const UserManagement = ({ onNotify }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { fetchCustomers, deleteCustomer } = useStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.custommerId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await fetchCustomers();
      setUsers(result || []);
      setFilteredUsers(result || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      onNotify("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (customerId) => {
    try {
      const deletedUser = await deleteCustomer(customerId);
      if (deletedUser) {
        setUsers(users.filter(user => user.custommerId !== customerId));
        onNotify("User deleted successfully!", "success");
      } else {
        onNotify("Failed to delete user!", "error");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      onNotify("Error deleting user!", "error");
    }
  };

  const handleRefresh = () => {
    fetchUsers();
    onNotify("Refreshing user list...", "info");
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexDirection: { xs: 'column', sm: 'row' }, 
        gap: 2, 
        mb: 3 
      }}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          User Management
          <Chip 
            label={users.length} 
            color="primary" 
            size="small" 
            sx={{ ml: 2, fontWeight: 'bold' }} 
          />
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search users"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 220 } }}
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            size="small"
          >
        
          </Button>
        </Box>
      </Box>

      {filteredUsers.length === 0 ? (
        <EmptyState 
          title="No Users Found"
          description={searchTerm ? "No users match your search criteria" : "You haven't added any users yet"} 
          icon={<PersonIcon sx={{ fontSize: 60 }} />}
        />
      ) : (
        <Grid container spacing={3}>
          {filteredUsers.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user._id}>
              <UserCard
                user={user}
                onDelete={() => handleDeleteUser(user.custommerId)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default UserManagement;