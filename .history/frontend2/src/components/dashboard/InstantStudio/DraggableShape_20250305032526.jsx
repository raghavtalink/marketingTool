import React from 'react';
import { Rect, Circle, Line } from 'react-konva';

const DraggableShape = ({ isSelected, onClick, onChange, shapeType, ...props }) => {
  const shapeRef = React.useRef();
  
  const ShapeComponent = shapeType === 'circle' ? Circle : 
                         shapeType === 'triangle' ? Line : Rect;
  
  const shapeProps = shapeType === 'triangle' 
    ? { 
        points: [0, 0, props.width / 2, -props.height, props.width, 0],
        closed: true
      } 
    : {};
  
  return (
    <ShapeComponent
      ref={shapeRef}
      onClick={onClick}
      onTap={onClick}
      draggable
      {...props}
      {...shapeProps}
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
          scaleX: 1,
          scaleY: 1,
        });
      }}
    />
  );
};

export default DraggableShape;