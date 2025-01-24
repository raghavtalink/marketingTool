import React from 'react';
import { FiEye, FiEyeOff, FiLock, FiUnlock } from 'react-icons/fi';
import './LayersPanel.css';

const LayersPanel = ({ layers, setLayers, selectedId, setSelectedId }) => {
    const toggleLayerVisibility = (e, layerId) => {
        e.stopPropagation();
        setLayers(prev => prev.map(layer => 
            layer.id === layerId 
                ? { ...layer, visible: !layer.visible }
                : layer
        ));
    };

    const toggleLayerLock = (e, layerId) => {
        e.stopPropagation();
        setLayers(prev => prev.map(layer =>
            layer.id === layerId
                ? { ...layer, locked: !layer.locked }
                : layer
        ));
    };

    const handleLayerClick = (layerId) => {
        const layer = layers.find(l => l.id === layerId);
        if (!layer.locked) {
            setSelectedId(layerId);
        }
    };

    return (
        <div className="layers-panel">
            <h3>Layers</h3>
            <div className="layers-list">
                {[...layers].reverse().map((layer) => (
                    <div 
                        key={layer.id}
                        className={`layer-item ${selectedId === layer.id ? 'selected' : ''}`}
                        onClick={() => handleLayerClick(layer.id)}
                    >
                        <div className="layer-controls">
                            <button
                                className={`layer-button ${layer.visible ? 'active' : ''}`}
                                onClick={(e) => toggleLayerVisibility(e, layer.id)}
                                title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                            >
                                {layer.visible ? <FiEye /> : <FiEyeOff />}
                            </button>
                            <button
                                className={`layer-button ${layer.locked ? 'active' : ''}`}
                                onClick={(e) => toggleLayerLock(e, layer.id)}
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