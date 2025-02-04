import React, { useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';

interface AlertBannerProps {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ open, message, severity, onClose }) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 20000); // 20 seconds

      // Cleanup timer on component unmount or when alert closes
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  return (
    <Snackbar
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AlertBanner; 