import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiEye, FiEyeOff, FiLock, FiUnlock, FiTrash2, FiMove } from 'react-icons/fi';
import './LayersPanel.css';

const SortableLayer = ({ layer, selectedId, onSelect, onVisibilityToggle, onLockToggle, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: layer.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleClick = (e) => {
        e.stopPropagation();
        onSelect(layer.id);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`layer-item ${selectedId === layer.id ? 'selected' : ''}`}
            onClick={handleClick}
        >
            <div className="layer-controls">
                <button 
                    className="layer-button drag-handle" 
                    {...attributes} 
                    {...listeners}
                >
                    <FiMove />
                </button>
                <button
                    className={`layer-button ${layer.visible ? 'active' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onVisibilityToggle(layer.id);
                    }}
                >
                    {layer.visible ? <FiEye /> : <FiEyeOff />}
                </button>
                <button
                    className={`layer-button ${layer.locked ? 'active' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onLockToggle(layer.id);
                    }}
                >
                    {layer.locked ? <FiLock /> : <FiUnlock />}
                </button>
                {layer.id !== 'background' && layer.id !== 'product' && (
                    <button
                        className="layer-button delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(layer.id);
                        }}
                    >
                        <FiTrash2 />
                    </button>
                )}
            </div>
            <div className="layer-info">
                <span className="layer-name">{layer.name}</span>
                <span className="layer-type">{layer.type}</span>
            </div>
        </div>
    );
};

const LayersPanel = ({ layers, setLayers, selectedId, setSelectedId, onDeleteLayer }) => {
    const handleDragEnd = (event) => {
        const { active, over } = event;
        
        if (active.id !== over.id) {
            const oldIndex = layers.findIndex(i => i.id === active.id);
            const newIndex = layers.findIndex(i => i.id === over.id);
            
            const newLayers = [...layers];
            const [removed] = newLayers.splice(oldIndex, 1);
            newLayers.splice(newIndex, 0, removed);
            
            setLayers(newLayers);
        }
    };

    const handleVisibilityToggle = (id) => {
        setLayers(prev => prev.map(layer => 
            layer.id === id ? { ...layer, visible: !layer.visible } : layer
        ));
    };

    const handleLockToggle = (id) => {
        setLayers(prev => prev.map(layer => 
            layer.id === id ? { ...layer, locked: !layer.locked } : layer
        ));
    };

    return (
        <div className="layers-panel">
            <h3>Layers</h3>
            <DndContext 
                collisionDetection={closestCenter} 
                onDragEnd={handleDragEnd}
            >
                <SortableContext 
                    items={layers.map(l => l.id)} 
                    strategy={verticalListSortingStrategy}
                >
                    <div className="layers-list">
                        {[...layers].reverse().map((layer) => (
                            <SortableLayer
                                key={layer.id}
                                layer={layer}
                                selectedId={selectedId}
                                onSelect={setSelectedId}
                                onVisibilityToggle={handleVisibilityToggle}
                                onLockToggle={handleLockToggle}
                                onDelete={onDeleteLayer}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default LayersPanel;