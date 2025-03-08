import React from 'react';
import { Text } from 'react-konva';

const DraggableText = ({ isSelected, onClick, onChange, ...props }) => {
  const textRef = React.useRef();
  
  return (
    <Text
      ref={textRef}
      onClick={onClick}
      onTap={onClick}
      draggable
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
        
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(5, node.width() * scaleX),
          rotation: node.rotation(),
          scaleX: 1,
        });
      }}
    />
  );
};

export default DraggableText;