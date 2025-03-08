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
    />
  );
};

export default Transformer;