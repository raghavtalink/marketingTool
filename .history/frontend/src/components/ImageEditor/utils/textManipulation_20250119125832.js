export const handleTextManipulation = {
    add: (position, setTextElements, setLayers) => {
        const newText = {
            id: `text-${Date.now()}`,
            text: 'Double click to edit',
            x: position.x,
            y: position.y,
            fontSize: 24,
            fontFamily: 'Arial',
            fill: '#ffffff',
            align: 'left',
            draggable: true,
            width: 200
        };

        setTextElements(prev => [...prev, newText]);
        setLayers(prev => [...prev, {
            id: newText.id,
            name: 'Text Layer',
            type: 'text',
            visible: true,
            locked: false
        }]);

        return newText.id;
    },

    update: (id, changes, textElements, setTextElements) => {
        setTextElements(prev => prev.map(text => 
            text.id === id ? { ...text, ...changes } : text
        ));
    },

    remove: (id, setTextElements, setLayers) => {
        setTextElements(prev => prev.filter(text => text.id !== id));
        setLayers(prev => prev.filter(layer => layer.id !== id));
    },

    startEditing: (id, textElements, stageRef) => {
        const text = textElements.find(t => t.id === id);
        if (!text) return;

        const stage = stageRef.current;
        const textPosition = stage.getPointerPosition();

        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        textarea.value = text.text;
        textarea.style.position = 'absolute';
        textarea.style.top = `${textPosition.y}px`;
        textarea.style.left = `${textPosition.x}px`;
        textarea.style.width = `${text.width}px`;
        textarea.style.height = 'auto';
        textarea.style.fontSize = `${text.fontSize}px`;
        textarea.style.fontFamily = text.fontFamily;
        textarea.style.color = text.fill;
        textarea.style.background = '#1e1e1e';
        textarea.style.border = '1px solid #0078d4';
        textarea.style.borderRadius = '4px';
        textarea.style.padding = '4px';
        textarea.style.zIndex = '1000';
        textarea.focus();

        return textarea;
    }
};