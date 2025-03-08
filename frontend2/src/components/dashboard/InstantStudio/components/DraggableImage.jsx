import React from 'react';
import { Image, Transformer } from 'react-konva';
import useImage from 'use-image';

const DraggableImage = ({ src, isSelected, onClick, onChange, ...props }) => {
  const [image] = useImage(src);
  const imageRef = React.useRef();
  
  React.useEffect(() => {
    if (isSelected && imageRef.current) {
      // Attach transformer manually
    }
  }, [isSelected]);
  
  return (
    <Image
      image={image}
      onClick={onClick}
      onTap={onClick}
      draggable
      ref={imageRef}
      {...props}
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
      }}
    />
  );
};

export default DraggableImage;