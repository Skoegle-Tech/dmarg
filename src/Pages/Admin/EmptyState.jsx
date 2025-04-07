import { Box, Typography, Button } from '@mui/material';

const EmptyState = ({ title, description, icon, actionText, onAction }) => {
  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
        px: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'divider',
      }}
    >
      {icon && (
        <Box sx={{ color: 'text.secondary', mb: 2 }}>
          {icon}
        </Box>
      )}
      <Typography variant="h6" gutterBottom fontWeight="medium">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: actionText ? 3 : 0 }}>
        {description}
      </Typography>
      {actionText && onAction && (
        <Button 
          variant="contained" 
          color="primary"
          onClick={onAction}
          sx={{ mt: 2 }}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;