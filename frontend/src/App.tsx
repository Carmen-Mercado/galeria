import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, CssBaseline } from '@mui/material';
import ImageCarousel from './components/ImageCarousel';
import UploadButton from './components/UploadButton';
import FilterMenu from './components/FilterMenu';
import AlertBanner from './components/AlertBanner';
import { getImages } from './services/api';
import { Image } from './types/image';

interface Filters {
  categories: string[];
  tags: string[];
  startDate: Date | null;
  endDate: Date | null;
}

function App(): JSX.Element {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
  const [activeFilters, setActiveFilters] = useState<Filters>({
    categories: [],
    tags: [],
    startDate: null,
    endDate: null,
  });

  // Extract unique categories and tags from images
  const categories = useMemo(() => 
    Array.from(new Set(images.map(img => img.category))).filter(Boolean)
  , [images]);

  const tags = useMemo(() => 
    Array.from(new Set(images.flatMap(img => img.tags || []))).filter(Boolean)
  , [images]);

  const showAlert = useCallback((message: string, severity: 'success' | 'error') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  }, []);

  const fetchImages = useCallback(async (filters?: Filters) => {
    try {
      setLoading(true);
      const response = await getImages(filters);
      if (response.code === 'SUCCESS') {
        setImages(response.data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      showAlert('Failed to fetch images', 'error');
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    void fetchImages();
  }, [fetchImages]);

  const handleUploadSuccess = useCallback((newImage: Image) => {
    // Just fetch all images without filters to show the new image
    void fetchImages();
    
    showAlert('Image uploaded successfully!', 'success');
  }, [fetchImages, showAlert]);

  const handleCloseAlert = useCallback(() => {
    setAlertOpen(false);
  }, []);

  const handleFilter = useCallback((filters: Filters) => {
    setActiveFilters(filters);
    void fetchImages(filters);
  }, [fetchImages]);

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <h1>Image Gallery</h1>
        {!loading && images.length > 0 && (
          <ImageCarousel images={images} />
        )}
        <UploadButton 
          onUploadSuccess={handleUploadSuccess}
          categories={categories}
        />
        <FilterMenu
          categories={categories}
          tags={tags}
          onFilter={handleFilter}
          activeFilters={activeFilters}
        />
        <AlertBanner
          open={alertOpen}
          message={alertMessage}
          severity={alertSeverity}
          onClose={handleCloseAlert}
        />
      </Container>
    </>
  );
}

export default App; 