import React, { useState } from 'react';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { Image } from '../types/image';

interface ImageCarouselProps {
  images: Image[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = images.length;

  const handleNext = () => {
    setActiveStep((prevStep) => (prevStep + 1) % maxSteps);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => (prevStep - 1 + maxSteps) % maxSteps);
  };

  if (!images.length) {
    return (
      <Paper
        square
        elevation={0}
        className="h-[70vh] flex items-center justify-center"
      >
        <Typography>No images available</Typography>
      </Paper>
    );
  }

  return (
    <Box className="relative w-full">
      <Paper
        square
        elevation={0}
        className="relative overflow-hidden h-[70vh] flex items-center justify-center"
      >
        <img
          src={images[activeStep].url}
          alt={images[activeStep].title}
          className="w-full h-full object-contain bg-black"
        />
        <Box className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
          <Typography className="text-white text-xl">
            {images[activeStep].title}
          </Typography>
          <Box className="flex flex-wrap gap-2 mt-2">
            {images[activeStep].tags.map((tag) => (
              <Typography
                key={tag}
                className="text-white text-sm bg-gray-700 px-2 py-1 rounded-full"
              >
                {tag}
              </Typography>
            ))}
          </Box>
        </Box>
      </Paper>
      <IconButton
        onClick={handleBack}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-100"
      >
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        onClick={handleNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-100"
      >
        <KeyboardArrowRight />
      </IconButton>
      <Box className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <Box
            key={index}
            className={`w-2 h-2 rounded-full cursor-pointer ${
              index === activeStep ? 'bg-white' : 'bg-gray-400'
            }`}
            onClick={() => setActiveStep(index)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ImageCarousel; 