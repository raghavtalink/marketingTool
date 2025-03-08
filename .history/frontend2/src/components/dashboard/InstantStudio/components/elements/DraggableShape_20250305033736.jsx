import React, { useRef } from 'react';
import { Rect, Circle, Line } from 'react-konva';

const DraggableShape = ({ 
  id,
  isSelected, 
  onClick, 
  onChange, 
  shapeType = 'rectangle',
  x = 100,
  y = 100,
  width = 100,
  height = 100,
  fill = '#4299e1',
  stroke = '#2b6cb0',
  strokeWidth = 2,
  rotation = 0,
  draggable = true
}) => {
  const shapeRef = useRef();
  
  // Determine which shape component to render
  const ShapeComponent = shapeType === 'circle' ? Circle : 
                         shapeType === 'triangle' ? Line : Rect;
  
  // Special props for triangle shape
  const shapeProps = shapeType === 'triangle' 
    ? { 
        points: [0, 0, width / 2, -height, width, 0],
        closed: true
      } 
    : {};
  
  // Special props for circle shape
  const circleProps = shapeType === 'circle'
    ? {
        radius: width / 2
      }
    : {};
  
  return (
    <ShapeComponent
      id={id}
      ref={shapeRef}
      x={x}
      y={y}
      width={shapeType !== 'circle' ? width : undefined}
      height={shapeType === 'rectangle' ? height : undefined}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      rotation={rotation}
      draggable={draggable}
      {...shapeProps}
      {...circleProps}
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
        const scaleY = node.scaleY();
        
        // For circle, we use radius instead of width/height
        if (shapeType === 'circle') {
          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            rotation: node.rotation(),
          });
        } else {
          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }
        
        // Reset scale to avoid accumulating transforms
        node.scaleX(1);
        node.scaleY(1);
      }}
    />
  );
};

export default DraggableShape;