import React, { useRef, useEffect } from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';

const DraggableImage = ({ 
  src, 
  isSelected, 
  onClick, 
  onChange, 
  x = 100, 
  y = 100, 
  width = 200, 
  height = 200,
  rotation = 0,
  opacity = 1,
  brightness = 1,
  contrast = 1,
  saturation = 1,
  blendMode = 'normal'
}) => {
  const imageRef = useRef();
  const [image] = useImage(src);
  
  // Apply filters based on props
  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.cache();
      
      // Create filters array
      const filters = [];
      
      // Add brightness filter if not default
      if (brightness !== 1) {
        filters.push(Konva.Filters.Brighten);
        imageRef.current.brightness(brightness - 1); // Konva uses -1 to 1 range
      }
      
      // Add contrast filter if not default
      if (contrast !== 1) {
        filters.push(Konva.Filters.Contrast);
        imageRef.current.contrast(contrast - 1); // Konva uses -1 to 1 range
      }
      
      // Add saturation filter if not default
      if (saturation !== 1) {
        filters.push(Konva.Filters.HSL);
        imageRef.current.saturation(saturation);
      }
      
      // Apply filters
      imageRef.current.filters(filters);
    }
  }, [brightness, contrast, saturation]);
  
  return (
    <Image
      id="product"
      ref={imageRef}
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      rotation={rotation}
      opacity={opacity}
      globalCompositeOperation={blendMode}
      onClick={onClick}
      onTap={onClick}
      draggable
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(5, node.height() * scaleY),
          rotation: node.rotation(),
        });
        
        // Reset scale to avoid accumulating transforms
        node.scaleX(1);
        node.scaleY(1);
      }}
    />
  );
};

export default DraggableImage;