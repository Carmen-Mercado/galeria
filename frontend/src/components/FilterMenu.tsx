import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Drawer,
  Typography,
  TextField,
  Autocomplete,
  IconButton,
  FormControl,
} from '@mui/material';
import { FilterList as FilterIcon, Close as CloseIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface Filters {
  categories: string[];
  tags: string[];
  startDate: Date | null;
  endDate: Date | null;
}

interface FilterMenuProps {
  categories: string[];
  tags: string[];
  onFilter: (filters: Filters) => void;
  activeFilters: Filters;
}

const FilterMenu: React.FC<FilterMenuProps> = ({ 
  categories, 
  tags, 
  onFilter,
  activeFilters 
}) => {
  const [open, setOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(activeFilters.categories);
  const [selectedTags, setSelectedTags] = useState<string[]>(activeFilters.tags);
  const [startDate, setStartDate] = useState<Date | null>(activeFilters.startDate);
  const [endDate, setEndDate] = useState<Date | null>(activeFilters.endDate);

  useEffect(() => {
    setSelectedCategories(activeFilters.categories);
    setSelectedTags(activeFilters.tags);
    setStartDate(activeFilters.startDate);
    setEndDate(activeFilters.endDate);
  }, [activeFilters]);

  const handleApplyFilters = useCallback(() => {
    onFilter({
      categories: selectedCategories,
      tags: selectedTags,
      startDate,
      endDate,
    });
    setOpen(false);
  }, [selectedCategories, selectedTags, startDate, endDate, onFilter]);

  const handleClearFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setStartDate(null);
    setEndDate(null);
    onFilter({
      categories: [],
      tags: [],
      startDate: null,
      endDate: null,
    });
  }, [onFilter]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleCategoryChange = useCallback((_: unknown, newValue: string[]) => {
    setSelectedCategories(newValue);
  }, []);

  const handleTagChange = useCallback((_: unknown, newValue: string[]) => {
    setSelectedTags(newValue);
  }, []);

  const handleStartDateChange = useCallback((newValue: Date | null) => {
    setStartDate(newValue);
  }, []);

  const handleEndDateChange = useCallback((newValue: Date | null) => {
    setEndDate(newValue);
  }, []);

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<FilterIcon />}
        onClick={handleOpen}
        sx={{ 
          position: 'fixed', 
          bottom: 32, 
          left: 32,
          backgroundColor: 'white',
          zIndex: 1000
        }}
      >
        {selectedCategories.length > 0 || selectedTags.length > 0 || startDate || endDate ? (
          <Box component="span" sx={{ ml: 1 }}>
            Filters ({selectedCategories.length + selectedTags.length + (startDate ? 1 : 0) + (endDate ? 1 : 0)})
          </Box>
        ) : 'Filters'}
      </Button>

      <Drawer
        anchor="left"
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: '320px', p: 3 }
        }}
      >
        <Box className="flex flex-col h-full">
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box className="flex flex-col gap-4 flex-grow">
            <FormControl fullWidth>
              <Autocomplete
                multiple
                options={categories}
                value={selectedCategories}
                onChange={handleCategoryChange}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Categories"
                    placeholder={categories.length ? "Select categories" : "No categories available"}
                  />
                )}
                noOptionsText="No categories available"
              />
            </FormControl>

            <FormControl fullWidth>
              <Autocomplete
                multiple
                options={tags}
                value={selectedTags}
                onChange={handleTagChange}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Tags"
                    placeholder={tags.length ? "Select tags" : "No tags available"}
                  />
                )}
                noOptionsText="No tags available"
              />
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={handleStartDateChange}
                slotProps={{
                  textField: { fullWidth: true }
                }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={handleEndDateChange}
                minDate={startDate || undefined}
                slotProps={{
                  textField: { fullWidth: true }
                }}
              />
            </LocalizationProvider>
          </Box>

          <Box className="flex gap-2 mt-4">
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              fullWidth
            >
              Clear
            </Button>
            <Button
              variant="contained"
              onClick={handleApplyFilters}
              fullWidth
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default FilterMenu; 