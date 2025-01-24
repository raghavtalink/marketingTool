import React from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiEye, FiEyeOff, FiLock, FiUnlock, FiTrash2, FiMove, FiImage, FiType } from 'react-icons/fi';
import './LayersPanel.css';

const LayerItem = ({ layer, selectedId, onSelect, onVisibilityToggle, onLockToggle, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: layer.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getLayerIcon = (type) => {
        switch (type) {
            case 'background': return <FiImage />;
            case 'product': return <FiImage />;
            case 'text': return <FiType />;
            default: return <FiImage />;
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`layer-item ${selectedId === layer.id ? 'selected' : ''}`}
            onClick={() => onSelect(layer.id)}
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
                {layer.type !== 'background' && (
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
                <span className="layer-icon">{getLayerIcon(layer.type)}</span>
                <span className="layer-name">{layer.name}</span>
                <span className="layer-type">{layer.type}</span>
            </div>
        </div>
    );
};

const LayersPanel = ({ 
    layers, 
    setLayers, 
    selectedId, 
    setSelectedId, 
    onDeleteLayer,
    onVisibilityToggle,
    onLockToggle,
    onReorder
}) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        
        if (active.id !== over.id) {
            const oldIndex = layers.findIndex(l => l.id === active.id);
            const newIndex = layers.findIndex(l => l.id === over.id);
            
            const newLayers = [...layers];
            const [removed] = newLayers.splice(oldIndex, 1);
            newLayers.splice(newIndex, 0, removed);
            
            setLayers(newLayers);
            onReorder(newLayers); // Callback to update canvas order
        }
    };

    return (
        <div className="layers-panel">
            <h3>Layers</h3>
            <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter} 
                onDragEnd={handleDragEnd}
            >
                <SortableContext 
                    items={layers.map(l => l.id)} 
                    strategy={verticalListSortingStrategy}
                >
                    <div className="layers-list">
                        {layers.map((layer) => (
                            <LayerItem
                                key={layer.id}
                                layer={layer}
                                selectedId={selectedId}
                                onSelect={setSelectedId}
                                onVisibilityToggle={onVisibilityToggle}
                                onLockToggle={onLockToggle}
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