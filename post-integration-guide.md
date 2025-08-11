import React, { useRef, useEffect, useState, useCallback } from 'react';

const PickerWheelComponent = ({ 
    initialOptions = ['Yes', 'No', 'Maybe', 'Ask Again'], 
    title = 'Random Decision Maker',
    description = 'Spin the wheel to make a choice!',
    width = 300,
    height = 300,
    onResult = null 
}) => {
    const canvasRef = useRef(null);
    const [items, setItems] = useState(initialOptions.map((text, index) => ({
        text,
        color: COLORS[index % COLORS.length],
        id: Date.now() + index
    })));
    const [inputValue, setInputValue] = useState('');
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [currentRotation, setCurrentRotation] = useState(0);

    const COLORS = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];

    const drawWheel = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = (canvas.width / 2) - 15;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (items.length === 0) {
            // Draw empty wheel
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.fillStyle = '#ecf0f1';
            ctx.fill();
            ctx.strokeStyle = '#bdc3c7';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#7f8c8d';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Add options!', centerX, centerY);
            return;
        }

        const angleStep = (2 * Math.PI) / items.length;

        items.forEach((item, index) => {
            const startAngle = index * angleStep + currentRotation;
            const endAngle = (index + 1) * angleStep + currentRotation;

            // Draw sector
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = item.color;
            ctx.fill();

            // Draw border
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw text
            const textAngle = startAngle + angleStep / 2;
            const textRadius = radius * 0.7;
            const textX = centerX + Math.cos(textAngle) * textRadius;
            const textY = centerY + Math.sin(textAngle) * textRadius;

            ctx.save();
            ctx.translate(textX, textY);
            ctx.rotate(textAngle + Math.PI / 2);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 1;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.fillText(item.text, 0, 0);
            ctx.restore();
        });

        // Draw center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
        ctx.fillStyle = '#2c3e50';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
    }, [items, currentRotation]);

    useEffect(() => {
        drawWheel();
    }, [drawWheel]);

    const addItem = () => {
        const text = inputValue.trim();
        if (text && !items.some(item => item.text === text)) {
            const newItem = {
                text,
                color: COLORS[items.length % COLORS.length],
                id: Date.now()
            };
            setItems([...items, newItem]);
            setInputValue('');
        }
    };

    const removeItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const clearItems = () => {
        setItems([]);
        setShowResult(false);
    };

    const spin = () => {
        if (isSpinning || items.length === 0) return;

        setIsSpinning(true);
        setShowResult(false);

        const spins = 3 + Math.random() * 3;
        const finalAngle = Math.random() * 2 * Math.PI;
        const targetRotation = currentRotation + spins * 2 * Math.PI + finalAngle;

        const startTime = Date.now();
        const duration = 2500;
        const startRotation = currentRotation;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);

            const newRotation = startRotation + (targetRotation - startRotation) * easeOut;
            setCurrentRotation(newRotation);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                finishSpin(newRotation);
            }
        };

        requestAnimationFrame(animate);
    };

    const finishSpin = (finalRotation) => {
        setIsSpinning(false);

        const normalizedRotation = finalRotation % (2 * Math.PI);
        const angleStep = (2 * Math.PI) / items.length;
        const pointerAngle = (3 * Math.PI / 2) - normalizedRotation;
        let winnerIndex = Math.floor(((pointerAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI) / angleStep);
        winnerIndex = (items.length - winnerIndex - 1) % items.length;

        const winner = items[winnerIndex];
        setResult(winner.text);
        setShowResult(true);

        if (onResult) {
            onResult(winner.text);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            addItem();
        }
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '30px 20px',
            margin: '30px 0',
            borderRadius: '15px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <h3 style={{ 
                    fontSize: '1.8rem', 
                    fontWeight: '700', 
                    marginBottom: '8px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                    🎯 {title}
                </h3>
                <p style={{ fontSize: '1rem', opacity: '0.9', marginBottom: '0' }}>
                    {description}
                </p>
            </div>

            {/* Main Content */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth > 768 ? '1fr 300px' : '1fr',
                gap: '25px',
                alignItems: 'start'
            }}>
                {/* Wheel Area */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                    <div style={{
                        position: 'relative',
                        display: 'inline-block',
                        padding: '10px',
                        background: 'white',
                        borderRadius: '50%',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                    }}>
                        <canvas
                            ref={canvasRef}
                            width={width}
                            height={height}
                            style={{
                                borderRadius: '50%',
                                display: 'block'
                            }}
                        />
                        {/* Pointer */}
                        <div style={{
                            position: 'absolute',
                            top: '-6px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '1.5rem',
                            color: '#ff4757',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                            zIndex: 10
                        }}>
                            ▼
                        </div>
                        {/* Spin Button */}
                        <button
                            onClick={spin}
                            disabled={isSpinning || items.length === 0}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                border: 'none',
                                background: isSpinning || items.length === 0 ? '#ccc' : 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '0.7rem',
                                cursor: isSpinning || items.length === 0 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: isSpinning || items.length === 0 ? 'none' : '0 4px 15px rgba(255, 107, 107, 0.4)',
                                zIndex: 10
                            }}
                        >
                            {isSpinning ? 'SPINNING...' : 'SPIN'}
                        </button>
                    </div>

                    {/* Result Display */}
                    {showResult && (
                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '15px',
                            boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
                            textAlign: 'center',
                            color: '#333',
                            minWidth: '250px',
                            animation: 'fadeInUp 0.5s ease'
                        }}>
                            <h4 style={{ color: '#666', marginBottom: '8px', fontWeight: '500' }}>
                                Result:
                            </h4>
                            <div style={{
                                fontSize: '1.2rem',
                                fontWeight: '600',
                                color: '#2c3e50',
                                padding: '12px',
                                background: '#f8f9fa',
                                borderRadius: '8px',
                                borderLeft: '4px solid #667eea'
                            }}>
                                {result}
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '15px',
                    padding: '20px',
                    color: '#333',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                    <h4 style={{
                        color: '#2c3e50',
                        marginBottom: '15px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        📝 Options
                    </h4>

                    {/* Add Option */}
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '15px',
                        flexWrap: 'wrap'
                    }}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Add option..."
                            maxLength={30}
                            style={{
                                flex: '1',
                                minWidth: '150px',
                                padding: '10px 12px',
                                border: '2px solid #e1e8ed',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                transition: 'border-color 0.3s ease'
                            }}
                        />
                        <button
                            onClick={addItem}
                            style={{
                                padding: '10px 15px',
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            ➕
                        </button>
                    </div>

                    {/* Items List */}
                    <div style={{
                        maxHeight: '150px',
                        overflowY: 'auto',
                        marginBottom: '15px'
                    }}>
                        {items.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 10px',
                                    background: '#f8f9fa',
                                    borderRadius: '6px',
                                    marginBottom: '5px',
                                    transition: 'all 0.3s ease',
                                    fontSize: '0.85rem'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div
                                        style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            backgroundColor: item.color,
                                            marginRight: '8px',
                                            border: '2px solid #fff',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <span style={{ fontWeight: '500' }}>{item.text}</span>
                                </div>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    style={{
                                        background: '#ff4757',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '3px',
                                        padding: '3px 5px',
                                        cursor: 'pointer',
                                        fontSize: '0.6rem',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={clearItems}
                            style={{
                                flex: '1',
                                padding: '8px 12px',
                                background: '#ff4757',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '0.8rem',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            🗑️ Clear
                        </button>
                        <button
                            onClick={() => {
                                setItems(initialOptions.map((text, index) => ({
                                    text,
                                    color: COLORS[index % COLORS.length],
                                    id: Date.now() + index
                                })));
                            }}
                            style={{
                                flex: '1',
                                padding: '8px 12px',
                                background: '#5dade2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '0.8rem',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            🔄 Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PickerWheelComponent;