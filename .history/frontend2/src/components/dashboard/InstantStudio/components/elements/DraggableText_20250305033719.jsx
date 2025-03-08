import React, { useRef } from 'react';
import { Text } from 'react-konva';

const DraggableText = ({ 
  id,
  isSelected, 
  onClick, 
  onChange, 
  text = 'Text',
  x = 100,
  y = 100,
  fontSize = 24,
  fontFamily = 'Arial',
  fill = '#ffffff',
  align = 'center',
  width = 200,
  rotation = 0,
  draggable = true
}) => {
  const textRef = useRef();
  
  return (
    <Text
      id={id}
      ref={textRef}
      text={text}
      x={x}
      y={y}
      fontSize={fontSize}
      fontFamily={fontFamily}
      fill={fill}
      align={align}
      width={width}
      rotation={rotation}
      draggable={draggable}
      onClick={onClick}
      onTap={onClick}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(5, node.width() * scaleX),
          rotation: node.rotation(),
        });
        
        // Reset scale to avoid accumulating transforms
        node.scaleX(1);
      }}
    />
  );
};

export default DraggableText;