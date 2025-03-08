import React, { useEffect, useRef } from 'react';
import { Transformer as KonvaTransformer } from 'react-konva';

const Transformer = ({ selectedElement, elements, stageRef }) => {
  const transformerRef = useRef();
  
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    
    const stage = stageRef.current;
    const transformer = transformerRef.current;
    
    if (selectedElement === null) {
      transformer.nodes([]);
      return;
    }
    
    // Find the selected node
    const selectedNode = stage.findOne(`#${selectedElement}`);
    
    if (selectedNode) {
      transformer.nodes([selectedNode]);
    } else {
      transformer.nodes([]);
    }
  }, [selectedElement, stageRef]);
  
  return (
    <KonvaTransformer
      ref={transformerRef}
      boundBoxFunc={(oldBox, newBox) => {
        // Limit resize to minimum dimensions
        if (newBox.width < 5 || newBox.height < 5) {
          return oldBox;
        }
        return newBox;
      }}
      enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
      rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
      rotateEnabled={true}
      keepRatio={false}
      borderStroke="#3182ce"
      borderStrokeWidth={2}
      anchorStroke="#3182ce"
      anchorFill="#fff"
      anchorSize={8}
      padding={5}
    />
  );
};

export default Transformer;