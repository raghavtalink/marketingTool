import React from 'react';
import { Stage, Layer } from 'react-konva';
import BackgroundImage from '../components//elements/BackgroundImage';
import DraggableImage from '../components//elements/DraggableImage';
import DraggableText from './elements/DraggableText';
import DraggableShape from './elements/DraggableShape';
import Transformer from '../components/Transformer';

const Canvas = ({ 
  stageRef, 
  canvasSize, 
  backgroundImage, 
  productImage, 
  elements, 
  layers, 
  selectedElement, 
  setSelectedElement,
  setElements 
}) => {
  return (
    <Stage
      width={canvasSize.width}
      height={canvasSize.height}
      ref={stageRef}
      onClick={(e) => {
        // Deselect when clicking on empty area
        if (e.target === e.target.getStage()) {
          setSelectedElement(null);
        }
      }}
    >
      <Layer>
        {/* Background Image */}
        {backgroundImage && (
          <BackgroundImage 
            src={backgroundImage} 
            width={canvasSize.width} 
            height={canvasSize.height} 
          />
        )}
        
        {/* Product Image */}
        {productImage && layers.find(l => l.id === 'product')?.visible && (
          <DraggableImage 
            src={productImage}
            isSelected={selectedElement === 'product'}
            onClick={() => setSelectedElement('product')}
            onChange={(newAttrs) => {
              // Update product image attributes in parent state
            }}
            x={canvasSize.width / 2 - 150}
            y={canvasSize.height / 2 - 150}
            width={300}
            height={300}
          />
        )}
        
        {/* Other Elements (Text, Shapes) */}
        {elements.map((element) => {
          if (!layers.find(l => l.id === element.id)?.visible) return null;
          
          switch(element.type) {
            case 'text':
              return (
                <DraggableText
                  key={element.id}
                  {...element}
                  isSelected={selectedElement === element.id}
                  onClick={() => setSelectedElement(element.id)}
                  onChange={(newAttrs) => {
                    setElements(
                      elements.map((el) => 
                        el.id === element.id ? { ...el, ...newAttrs } : el
                      )
                    );
                  }}
                />
              );
            case 'shape':
              return (
                <DraggableShape
                  key={element.id}
                  {...element}
                  isSelected={selectedElement === element.id}
                  onClick={() => setSelectedElement(element.id)}
                  onChange={(newAttrs) => {
                    setElements(
                      elements.map((el) => 
                        el.id === element.id ? { ...el, ...newAttrs } : el
                      )
                    );
                  }}
                />
              );
            default:
              return null;
          }
        })}
        
        {/* Transformer for selected element */}
        <Transformer 
          selectedElement={selectedElement} 
          elements={elements} 
          stageRef={stageRef} 
        />
      </Layer>
    </Stage>
  );
};

export default Canvas;