import React from 'react';
import { FiEye, FiEyeOff, FiLock, FiUnlock } from 'react-icons/fi';
import './LayersPanel.css';

const LayersPanel = ({ layers, setLayers, selectedId, setSelectedId }) => {
    const toggleLayerVisibility = (layerId) => {
        setLayers(prev => prev.map(layer => 
            layer.id === layerId 
                ? { ...layer, visible: !layer.visible }
                : layer
        ));
    };

    const toggleLayerLock = (layerId) => {
        setLayers(prev => prev.map(layer =>
            layer.id === layerId
                ? { ...layer, locked: !layer.locked }
                : layer
        ));
    };

    return (
        <div className="layers-panel">
            <h3>Layers</h3>
            <div className="layers-list">
                {layers.map((layer, index) => (
                    <div 
                        key={layer.id}
                        className={`layer-item ${selectedId === layer.id ? 'selected' : ''}`}
                        onClick={() => !layer.locked && setSelectedId(layer.id)}
                    >
                        <div className="layer-controls">
                            <button
                                className="layer-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLayerVisibility(layer.id);
                                }}
                                title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                            >
                                {layer.visible ? <FiEye /> : <FiEyeOff />}
                            </button>
                            <button
                                className="layer-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLayerLock(layer.id);
                                }}
                                title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                            >
                                {layer.locked ? <FiLock /> : <FiUnlock />}
                            </button>
                        </div>
                        <div className="layer-info">
                            <span className="layer-name">{layer.name}</span>
                            <span className="layer-type">{layer.type}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LayersPanel;