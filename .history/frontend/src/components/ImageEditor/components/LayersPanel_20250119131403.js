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

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`layer-item ${selectedId === layer.id ? 'selected' : ''}`}
            onClick={() => onSelect(layer.id)}
        >
            <div className="layer-controls">
                <button className="layer-button drag-handle" {...attributes} {...listeners}>
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
                <button
                    className="layer-button delete"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(layer.id);
                    }}
                >
                    <FiTrash2 />
                </button>
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
            setLayers((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                
                const newItems = [...items];
                const [removed] = newItems.splice(oldIndex, 1);
                newItems.splice(newIndex, 0, removed);
                
                return newItems;
            });
        }
    };

    return (
        <div className="layers-panel">
            <h3>Layers</h3>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={layers.map(l => l.id)} strategy={verticalListSortingStrategy}>
                    <div className="layers-list">
                        {[...layers].reverse().map((layer) => (
                            <SortableLayer
                                key={layer.id}
                                layer={layer}
                                selectedId={selectedId}
                                onSelect={setSelectedId}
                                onVisibilityToggle={(id) => {
                                    setLayers(prev => prev.map(l => 
                                        l.id === id ? { ...l, visible: !l.visible } : l
                                    ));
                                }}
                                onLockToggle={(id) => {
                                    setLayers(prev => prev.map(l => 
                                        l.id === id ? { ...l, locked: !l.locked } : l
                                    ));
                                }}
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