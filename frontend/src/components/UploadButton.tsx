import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Chip,
  Autocomplete,
} from '@mui/material';
import { Add as AddIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { uploadImage } from '../services/api';
import AlertBanner from './AlertBanner';
import { Image } from '../types/image';

interface UploadButtonProps {
  onUploadSuccess: (newImage: Image) => void;
  categories: string[];
}

const UploadButton: React.FC<UploadButtonProps> = ({ onUploadSuccess, categories }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Alert states
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setTags([]);
    setCurrentTag('');
    setFile(null);
    setUploading(false);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const showAlert = (message: string, severity: 'success' | 'error') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleUpload = async () => {
    if (!file || !title || !category) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('tags', JSON.stringify(tags));

      const response = await uploadImage(formData);
      
      if (response.code === 'SUCCESS' && response.data) {
        // Pass the new image data to the parent
        onUploadSuccess(response.data as Image);
        handleClose();
        showAlert('Image uploaded successfully!', 'success');
      } else {
        showAlert('Failed to upload image. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showAlert('Failed to upload image. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleOpen}
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
      >
        Upload Image
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Upload New Image</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
            />

            <Autocomplete
              freeSolo
              options={categories}
              value={category}
              onChange={(_, newValue) => setCategory(newValue || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Category"
                  required
                  placeholder={categories.length ? "Select or type new category" : "Type new category"}
                />
              )}
              noOptionsText="No categories available"
            />

            <TextField
              label="Add Tags"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={handleAddTag}
              helperText="Press Enter to add tags"
              fullWidth
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => setTags(tags.filter((t) => t !== tag))}
                />
              ))}
            </Box>

            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              disabled={uploading}
            >
              {file ? file.name : 'Choose Image'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile && selectedFile.size <= 5 * 1024 * 1024) { // 5MB limit
                    setFile(selectedFile);
                  } else {
                    alert('Please select an image under 5MB');
                  }
                }}
              />
            </Button>
            {file && (
              <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={uploading}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!file || !title || !category || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      <AlertBanner
        open={alertOpen}
        message={alertMessage}
        severity={alertSeverity}
        onClose={() => setAlertOpen(false)}
      />
    </>
  );
};

export default UploadButton; 