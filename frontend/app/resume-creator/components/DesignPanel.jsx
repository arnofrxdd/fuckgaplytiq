import React, { useRef, useState, useMemo } from 'react';
import { RotateCcw, ChevronDown, Check, X, Palette, Type, Maximize, ArrowLeft, MoveVertical, AlignLeft, Layout as LayoutIcon, Sliders as SlidersIcon, Type as TypeIcon, Maximize2, MoveHorizontal, ALargeSmall, Pipette } from 'lucide-react';
import { templatesConfig } from '../templates/TemplateManager';
import { RESUME_FONTS } from '@/lib/fonts.config';

export default function DesignPanel({ data, setData, settings, setSettings, templateId, onColorChange, onClose, isMobile, onSubTabChange }) {
    const colorInputRef = useRef(null);
    const [subTab, setSubTab] = useState('main');
    const [showCustomTuning, setShowCustomTuning] = useState(false);
    const [showFontDropdown, setShowFontDropdown] = useState(false);

    const handleSubTabChange = (tab) => {
        setSubTab(tab);
        if (tab !== 'color') setShowCustomTuning(false);
        if (onSubTabChange) onSubTabChange(tab);
    };

    const baseColors = [
        '#3b82f6', '#10b981', '#1e293b', '#8b5cf6',
        '#ef4444', '#f97316', '#2563eb', '#db2777',
        '#7c3aed', '#0891b2', '#059669', '#ca8a04',
        '#475569', '#14b8a6', '#f43f5e', '#84cc16'
    ];

    const currentTemplateId = templateId || data.templateId || 'unified-template';
    const templateConfig = templatesConfig.find(t => t.id === currentTemplateId);
    const activeColor = data.themeColor || templateConfig?.defaultColor || '#3b82f6';
    const recommendedColors = templateConfig?.recommendedColors || [];

    let colors = [...baseColors];
    if (templateConfig?.defaultColor && !colors.includes(templateConfig.defaultColor)) {
        colors = [templateConfig.defaultColor, ...baseColors];
    }
    if (activeColor && !colors.includes(activeColor)) {
        colors = [activeColor, ...colors];
    }

const fonts = RESUME_FONTS.map(f => f.name);

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 59, g: 130, b: 246 }; // Blue-500 fallback
    };

    const rgbToHex = (r, g, b) => {
        const toHex = (n) => {
            const hex = Math.max(0, Math.min(255, n)).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };
        return "#" + toHex(r) + toHex(g) + toHex(b);
    };

    const hexToHsl = (hex) => {
        let { r, g, b } = hexToRgb(hex);
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) { h = s = 0; }
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    };

    const hslToHex = (h, s, l) => {
        s /= 100; l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return rgbToHex(Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4)));
    };

    const handleRgbChange = (channel, value) => {
        const val = parseInt(value, 10) || 0;
        const rgb = hexToRgb(activeColor);
        const newRgb = { ...rgb, [channel]: val };
        handleColorClick(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    };

    const handleHueChange = (e) => {
        const hue = parseInt(e.target.value, 10);
        const { s, l } = hexToHsl(activeColor);
        handleColorClick(hslToHex(hue, s || 70, l || 50));
    };

    const handleHexChange = (e) => {
        let val = e.target.value;
        if (!val.startsWith('#')) val = '#' + val;
        if (/^#?([a-f\d]{3}){1,2}$/i.test(val)) {
            handleColorClick(val);
        }
    };

    const rgbValues = useMemo(() => hexToRgb(activeColor), [activeColor]);
    const hslValues = useMemo(() => hexToHsl(activeColor), [activeColor]);

    const handleColorClick = (color) => {
        if (onColorChange) onColorChange(color);
        else setData(prev => ({ ...prev, themeColor: color }));
    };

    const handleCustomColorClick = () => {
        setShowCustomTuning(!showCustomTuning);
        if (!showCustomTuning) {
            // Optional: If we want to still trigger the native picker on FIRST click
            // colorInputRef.current?.click();
        }
    };
    const handleCustomColorChange = (e) => handleColorClick(e.target.value);

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const resetDefaults = () => {
        if (templateConfig && templateConfig.defaults) {
            setSettings(templateConfig.defaults);
            if (templateConfig.defaultColor) handleColorClick(templateConfig.defaultColor);
        } else {
            const fallbacks = {
                fontSize: 1, fontFamily: 'Inter', sectionSpacing: 1,
                paragraphSpacing: 1, lineHeight: 1.5, letterSpacing: 0, pageMargin: 40
            };
            setSettings(fallbacks);
            handleColorClick('#3b82f6');
        }
    };

    // --- MOBILE UI COMPONENTS ---
    const MobileToolItem = ({ icon: Icon, label, id }) => (
        <button
            onClick={() => handleSubTabChange(id)}
            style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minWidth: '68px', height: '64px', background: 'transparent', border: 'none',
                color: subTab === id ? '#7c3aed' : '#475569', gap: '2px', cursor: 'pointer',
                transition: 'all 0.2s'
            }}
        >
            <div style={{ padding: '6px', borderRadius: '8px', background: subTab === id ? '#f5f3ff' : 'transparent' }}>
                <Icon size={18} />
            </div>
            <span style={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        </button>
    );

    const CompactSliderView = ({ itemKey, label, icon: Icon }) => {
        const defVal = templateConfig?.defaults?.[itemKey] || (itemKey === 'lineHeight' ? 1.5 : (itemKey === 'pageMargin' ? 40 : 1));
        const currentVal = settings[itemKey] || defVal;
        const sliderVal = itemKey === 'pageMargin' ? (currentVal / 40) * 50 : (currentVal / defVal) * 50;
        const pct = Math.max(0, Math.min(100, sliderVal));

        const applyPct = (clientX, rect) => {
            const rawPct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            const newSliderVal = 1 + rawPct * 99;
            const newVal = itemKey === 'pageMargin' ? (newSliderVal / 50) * 40 : (newSliderVal / 50) * defVal;
            updateSetting(itemKey, newVal);
        };

        const onPointerDown = (e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            applyPct(e.clientX, e.currentTarget.getBoundingClientRect());
        };

        const onPointerMove = (e) => {
            if (e.buttons === 0 && e.pressure === 0) return;
            applyPct(e.clientX, e.currentTarget.getBoundingClientRect());
        };

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px 20px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => handleSubTabChange('main')} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#7c3aed' }}>
                            <ArrowLeft size={18} />
                        </button>
                        <Icon size={16} color="#7c3aed" />
                        <span style={{ fontSize: '11px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase' }}>{label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 900, color: '#7c3aed', background: '#f5f3ff', padding: '3px 6px', borderRadius: '4px' }}>{Math.round(pct * 2)}%</span>
                        <X size={18} color="#94a3b8" onClick={onClose} style={{ cursor: 'pointer' }} />
                    </div>
                </div>

                {/* Custom pointer-events slider — reliably works on Chrome emulator & real touch */}
                <div
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    style={{
                        position: 'relative',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        touchAction: 'none',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                    }}
                >
                    {/* Track */}
                    <div style={{ position: 'absolute', left: 0, right: 0, height: '6px', background: '#e2e8f0', borderRadius: '3px' }} />
                    {/* Fill */}
                    <div style={{ position: 'absolute', left: 0, width: `${pct}%`, height: '6px', background: '#7c3aed', borderRadius: '3px' }} />
                    {/* Thumb */}
                    <div style={{
                        position: 'absolute',
                        left: `calc(${pct}% - 14px)`,
                        width: '28px', height: '28px',
                        borderRadius: '50%',
                        background: '#7c3aed',
                        border: '3px solid #ffffff',
                        boxShadow: '0 2px 8px rgba(124,58,237,0.4)',
                        pointerEvents: 'none',
                    }} />
                </div>
            </div>
        );
    };

    if (isMobile) {
        return (
            <div className={`design-panel mobile-redesign ${subTab !== 'main' ? 'is-editing-tool' : ''}`} style={{
                display: 'flex', flexDirection: 'column', background: '#ffffff', overflow: 'hidden', paddingBottom: 'env(safe-area-inset-bottom)'
            }}>
                {subTab === 'main' ? (
                    <>
                        <div style={{ padding: '12px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Designer Studio</span>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <button
                                    onClick={resetDefaults}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        background: '#f5f3ff',
                                        border: 'none',
                                        color: '#7c3aed',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '9px',
                                        fontWeight: 800,
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    <RotateCcw size={10} /> RESET
                                </button>
                                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            overflowX: 'auto',
                            padding: '4px 2px',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }}>
                            <MobileToolItem icon={Palette} label="Theme" id="color" />
                            <MobileToolItem icon={TypeIcon} label="Font" id="font" />
                            <MobileToolItem icon={ALargeSmall} label="Scaling" id="size" />
                            <MobileToolItem icon={MoveHorizontal} label="Letter" id="letterSpacing" />
                            <MobileToolItem icon={MoveVertical} label="Section" id="sectionSpacing" />
                            <MobileToolItem icon={AlignLeft} label="Line" id="lineHeight" />
                            <MobileToolItem icon={Maximize2} label="Margin" id="pageMargin" />
                            <MobileToolItem icon={LayoutIcon} label="Block" id="paragraphSpacing" />
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {subTab === 'color' && (
                            <div style={{ padding: '16px 20px 24px', maxHeight: '70vh', overflowY: 'auto', scrollbarWidth: 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button onClick={() => handleSubTabChange('main')} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#7c3aed' }}>
                                            <ArrowLeft size={18} />
                                        </button>
                                        <span style={{ fontSize: '11px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Theme Color</span>
                                    </div>
                                    <X size={16} color="#94a3b8" onClick={onClose} style={{ cursor: 'pointer' }} />
                                </div>

                                {recommendedColors.length > 0 && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.02em' }}>Recommended Palettes</p>
                                        <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', scrollbarWidth: 'none', padding: '10px 4px', margin: '0 -4px' }}>
                                            {recommendedColors.map((c, idx) => (
                                                <div
                                                    key={`rec-${idx}`}
                                                    onClick={() => handleColorClick(c)}
                                                    style={{
                                                        width: '42px',
                                                        height: '42px',
                                                        borderRadius: '12px',
                                                        backgroundColor: c,
                                                        flexShrink: 0,
                                                        border: '1px solid rgba(0,0,0,0.06)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: activeColor === c ? `0 0 0 2px white, 0 0 0 5px #7c3aed` : 'none',
                                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        cursor: 'pointer',
                                                        zIndex: activeColor === c ? 2 : 1
                                                    }}
                                                >
                                                    {activeColor === c && <Check size={20} color="white" strokeWidth={4} />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.02em' }}>Expert Presets</p>
                                    <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', padding: '10px 4px 16px', margin: '0 -4px', scrollbarWidth: 'none' }}>
                                        <div
                                            onClick={handleCustomColorClick}
                                            style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '12px',
                                                flexShrink: 0,
                                                position: 'relative',
                                                cursor: 'pointer',
                                                overflow: 'hidden',
                                                border: '1px solid rgba(0,0,0,0.06)',
                                                boxShadow: !colors.includes(activeColor) ? `0 0 0 2px white, 0 0 0 5px #7c3aed` : 'none',
                                                zIndex: !colors.includes(activeColor) ? 2 : 1
                                            }}
                                        >
                                            <div className="gradient-sweep" style={{ width: '100%', height: '100%', borderRadius: '0' }} />
                                            <input type="color" ref={colorInputRef} style={{ display: 'none' }} onChange={handleCustomColorChange} value={activeColor} />
                                            {!colors.includes(activeColor) && (
                                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)' }}>
                                                    <Check size={20} color="white" strokeWidth={4} />
                                                </div>
                                            )}
                                        </div>
                                        {colors.map(c => (
                                            <div
                                                key={c}
                                                style={{
                                                    backgroundColor: c,
                                                    width: '44px',
                                                    height: '44px',
                                                    borderRadius: '12px',
                                                    flexShrink: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    border: '1px solid rgba(0,0,0,0.06)',
                                                    boxShadow: activeColor === c ? `0 0 0 2px white, 0 0 0 5px #7c3aed` : 'none',
                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    zIndex: activeColor === c ? 2 : 1
                                                }}
                                                onClick={() => handleColorClick(c)}
                                            >
                                                {activeColor === c && <Check size={20} color="white" strokeWidth={4} />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {showCustomTuning && (
                                    <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
                                        <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.02em', marginTop: '20px' }}>Custom Tuning</p>
                                        <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0' }}>
                                            {/* RGB Sliders */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                                                {[
                                                    { label: 'R', key: 'r', color: '#ef4444' },
                                                    { label: 'G', key: 'g', color: '#10b981' },
                                                    { label: 'B', key: 'b', color: '#3b82f6' }
                                                ].map(({ label, key, color }) => (
                                                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <span style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', width: '12px' }}>{label}</span>
                                                        <input
                                                            type="range"
                                                            min="0" max="255"
                                                            value={rgbValues[key]}
                                                            onChange={(e) => handleRgbChange(key, e.target.value)}
                                                            style={{
                                                                flex: 1,
                                                                height: '4px',
                                                                borderRadius: '2px',
                                                                accentColor: activeColor,
                                                                WebkitAppearance: 'none',
                                                                background: '#e2e8f0'
                                                            }}
                                                        />
                                                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#0f172a', width: '24px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{rgbValues[key]}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Hex Input */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: activeColor }} />
                                                <input
                                                    type="text"
                                                    value={activeColor.toUpperCase()}
                                                    onChange={handleHexChange}
                                                    maxLength={7}
                                                    style={{
                                                        flex: 1,
                                                        border: 'none',
                                                        fontSize: '12px',
                                                        fontWeight: 700,
                                                        color: '#0f172a',
                                                        outline: 'none',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em'
                                                    }}
                                                />
                                                <button
                                                    onClick={() => colorInputRef.current?.click()}
                                                    style={{ background: 'none', border: 'none', padding: '4px', display: 'flex', alignItems: 'center', color: '#94a3b8' }}
                                                >
                                                    <Pipette size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {subTab === 'font' && (
                            <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', maxHeight: '75vh', overflowY: 'auto', scrollbarWidth: 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button onClick={() => handleSubTabChange('main')} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#7c3aed' }}>
                                            <ArrowLeft size={18} />
                                        </button>
                                        <span style={{ fontSize: '11px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase' }}>Typography</span>
                                    </div>
                                    <X size={16} color="#94a3b8" onClick={onClose} style={{ cursor: 'pointer' }} />
                                </div>
                                
                                <button 
                                    onClick={() => setShowFontDropdown(!showFontDropdown)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        background: '#f8fafc',
                                        border: `2px solid ${showFontDropdown ? '#7c3aed' : '#e2e8f0'}`,
                                        borderRadius: '12px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '12px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <span style={{ 
                                        fontFamily: `var(${RESUME_FONTS.find(f => f.name === settings.fontFamily)?.variable || '--font-inter'})`,
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        color: '#0f172a'
                                    }}>
                                        {settings.fontFamily}
                                    </span>
                                    <ChevronDown 
                                        size={18} 
                                        style={{ 
                                            transform: showFontDropdown ? 'rotate(180deg)' : 'rotate(0)', 
                                            transition: 'transform 0.2s', 
                                            color: '#7c3aed' 
                                        }} 
                                    />
                                </button>

                                {showFontDropdown && (
                                    <div style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        gap: '20px', 
                                        maxHeight: '45vh', 
                                        overflowY: 'auto', 
                                        padding: '4px',
                                        background: '#ffffff',
                                        borderRadius: '12px',
                                        border: '1px solid #f1f5f9',
                                        scrollbarWidth: 'none',
                                        animation: 'fadeIn 0.2s ease-out'
                                    }}>
                                        {[
                                            { title: 'Professional Sans', type: 'sans' },
                                            { title: 'Elegant Serif', type: 'serif' },
                                            { title: 'Creative', type: 'creative' },
                                            { title: 'Modern Mono', type: 'mono' }
                                        ].map(cat => (
                                            <div key={cat.type}>
                                                <p style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>{cat.title}</p>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '6px' }}>
                                                    {RESUME_FONTS.filter(f => f.type === cat.type).map(f => (
                                                        <button
                                                            key={f.name}
                                                            onClick={() => {
                                                                updateSetting('fontFamily', f.name);
                                                                setShowFontDropdown(false);
                                                            }}
                                                            style={{
                                                                padding: '12px 14px',
                                                                background: settings.fontFamily === f.name ? '#f5f3ff' : '#ffffff',
                                                                border: `1.5px solid ${settings.fontFamily === f.name ? '#7c3aed' : '#f1f5f9'}`,
                                                                borderRadius: '10px',
                                                                textAlign: 'left',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center'
                                                        }}
                                                        >
                                                            <div style={{ 
                                                                fontFamily: `var(${f.variable}), ${f.type === 'serif' ? 'serif' : 'sans-serif'}`,
                                                                fontSize: '15px',
                                                                color: settings.fontFamily === f.name ? '#7c3aed' : '#1e293b'
                                                            }}>
                                                                {f.name}
                                                            </div>
                                                            {settings.fontFamily === f.name && <Check size={14} color="#7c3aed" strokeWidth={3} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {subTab === 'size' && (
                            <div style={{ padding: '12px 20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button onClick={() => handleSubTabChange('main')} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#7c3aed' }}>
                                            <ArrowLeft size={18} />
                                        </button>
                                        <span style={{ fontSize: '11px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase' }}>Font Scaling</span>
                                    </div>
                                    <X size={16} color="#94a3b8" onClick={onClose} style={{ cursor: 'pointer' }} />
                                </div>
                                <div style={{
                                    display: 'flex',
                                    background: '#f1f5f9',
                                    padding: '4px',
                                    borderRadius: '12px',
                                    gap: '4px'
                                }}>
                                    {[
                                        { label: 'Compact', val: 0.85 },
                                        { label: 'Standard', val: 1 },
                                        { label: 'Relaxed', val: 1.15 }
                                    ].map(opt => (
                                        <button
                                            key={opt.label}
                                            onClick={() => updateSetting('fontSize', opt.val)}
                                            style={{
                                                flex: 1,
                                                padding: '10px 4px',
                                                background: settings.fontSize === opt.val ? '#ffffff' : 'transparent',
                                                border: 'none',
                                                borderRadius: '10px',
                                                color: settings.fontSize === opt.val ? '#7c3aed' : '#64748b',
                                                boxShadow: settings.fontSize === opt.val ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            <div style={{
                                                fontSize: opt.val === 0.85 ? '10px' : (opt.val === 1 ? '13px' : '16px'),
                                                fontWeight: 900,
                                                height: '24px',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>Aa</div>
                                            <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {subTab === 'letterSpacing' && <CompactSliderView itemKey="letterSpacing" label="Letter Space" icon={MoveHorizontal} />}
                        {subTab === 'sectionSpacing' && <CompactSliderView itemKey="sectionSpacing" label="Section Gap" icon={MoveVertical} />}
                        {subTab === 'lineHeight' && <CompactSliderView itemKey="lineHeight" label="Line Height" icon={AlignLeft} />}
                        {subTab === 'pageMargin' && <CompactSliderView itemKey="pageMargin" label="Page Padding" icon={Maximize2} />}
                        {subTab === 'paragraphSpacing' && <CompactSliderView itemKey="paragraphSpacing" label="Block Spacing" icon={LayoutIcon} />}
                    </div>
                )}
            </div>
        );
    }

    // --- PC UI (UNCHANGED) ---
    return (
        <div className="design-panel pc-standard" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div className="pane-header-with-close" style={{ padding: '24px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 className="pane-title">Design & Formatting</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={resetDefaults} style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <RotateCcw size={12} /> Reset
                    </button>
                    <button className="pane-close-btn" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="design-content-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
                <div className="templates-section" style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 className="section-label-mid" style={{ marginBottom: 0 }}>Color Theme</h3>
                        <button 
                            onClick={() => setShowCustomTuning(!showCustomTuning)}
                            style={{ 
                                fontSize: '10px', 
                                fontWeight: 800, 
                                color: showCustomTuning ? '#7c3aed' : '#94a3b8', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                background: showCustomTuning ? '#f5f3ff' : 'transparent',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <SlidersIcon size={12} /> {showCustomTuning ? 'HIDE TUNING' : 'CUSTOM COLOR'}
                        </button>
                    </div>

                    <div className="color-picker-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: showCustomTuning ? '20px' : 0 }}>
                        {colors.map(c => (
                            <div 
                                key={c} 
                                className={`color-circle ${activeColor === c ? 'active' : ''}`} 
                                style={{ 
                                    backgroundColor: c, 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '10px',
                                    cursor: 'pointer', 
                                    border: activeColor === c ? '2.5px solid white' : '1px solid rgba(0,0,0,0.06)', 
                                    boxShadow: activeColor === c ? `0 0 0 2px ${c}, 0 4px 12px rgba(0,0,0,0.1)` : '0 2px 4px rgba(0,0,0,0.02)',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }} 
                                onClick={() => {
                                    handleColorClick(c);
                                    setShowCustomTuning(false);
                                }} 
                            >
                                {activeColor === c && <Check size={16} color="white" strokeWidth={3} />}
                            </div>
                        ))}
                    </div>

                    {showCustomTuning && (
                        <div style={{ 
                            background: '#f8fafc', 
                            borderRadius: '16px', 
                            padding: '20px', 
                            border: '1px solid #e2e8f0',
                            animation: 'fadeIn 0.2s ease-out'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Hue Slider */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <label style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Color Hue</label>
                                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#7c3aed' }}>{hslValues.h}°</span>
                                    </div>
                                    <div style={{ position: 'relative', height: '12px', borderRadius: '6px', background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)' }}>
                                        <input 
                                            type="range" 
                                            min="0" max="360" 
                                            value={hslValues.h}
                                            onChange={handleHueChange}
                                            style={{
                                                position: 'absolute',
                                                top: 0, left: 0, width: '100%', height: '100%',
                                                opacity: 0, cursor: 'pointer'
                                            }}
                                        />
                                        <div style={{ 
                                            position: 'absolute', 
                                            top: '50%', 
                                            left: `${(hslValues.h / 360) * 100}%`,
                                            transform: 'translate(-50%, -50%)',
                                            width: '18px', height: '18px',
                                            background: activeColor,
                                            border: '3px solid white',
                                            borderRadius: '50%',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                            pointerEvents: 'none'
                                        }} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {/* RGB Inputs */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        {[
                                            { label: 'R', key: 'r', color: '#ef4444' },
                                            { label: 'G', key: 'g', color: '#10b981' },
                                            { label: 'B', key: 'b', color: '#3b82f6' }
                                        ].map(({ label, key, color }) => (
                                            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', width: '12px' }}>{label}</span>
                                                <input
                                                    type="range"
                                                    min="0" max="255"
                                                    value={rgbValues[key]}
                                                    onChange={(e) => handleRgbChange(key, e.target.value)}
                                                    style={{ flex: 1, accentColor: color, height: '4px', cursor: 'pointer' }}
                                                />
                                                <div style={{ background: 'white', borderRadius: '6px', padding: '4px 10px', border: '1px solid #e2e8f0', minWidth: '44px', textAlign: 'center' }}>
                                                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{rgbValues[key]}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Hex Input & Preview Row */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Hex Code</label>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '10px', 
                                                background: '#ffffff', 
                                                padding: '10px 14px', 
                                                borderRadius: '12px', 
                                                border: '1.2px solid #e2e8f0'
                                            }}>
                                                <div style={{ width: '18px', height: '18px', borderRadius: '5px', backgroundColor: activeColor, flexShrink: 0, border: '1px solid rgba(0,0,0,0.05)' }} />
                                                <input
                                                    type="text"
                                                    value={activeColor.toUpperCase()}
                                                    onChange={handleHexChange}
                                                    maxLength={7}
                                                    style={{ border: 'none', width: '100%', fontSize: '14px', fontWeight: 700, outline: 'none', textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.02em' }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ width: '1px', height: '32px', background: '#e2e8f0', alignSelf: 'flex-end', marginBottom: '10px' }} />
                                        <div style={{ alignSelf: 'flex-end', marginBottom: '8px' }}>
                                            <p style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Preview</p>
                                            <div style={{ width: '38px', height: '24px', borderRadius: '6px', background: activeColor, border: '1px solid rgba(0,0,0,0.1)' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {recommendedColors.length > 0 && (
                    <div className="templates-section" style={{ marginBottom: '32px' }}>
                        <h3 className="section-label-mid">Template Palettes</h3>
                        <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '12px', fontWeight: 600 }}>Curated for {templateConfig?.name || 'this template'}</p>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {recommendedColors.map((c, idx) => (
                                <div key={idx} onClick={() => handleColorClick(c)} title={c} style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: c, cursor: 'pointer', border: activeColor === c ? '2px solid white' : '1px solid rgba(0,0,0,0.08)', boxShadow: activeColor === c ? `0 0 0 2.5px ${c}, 0 4px 12px rgba(0,0,0,0.15)` : '0 2px 6px rgba(0,0,0,0.08)', transform: activeColor === c ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.2s ease', position: 'relative', flexShrink: 0 }}>
                                    {activeColor === c && <svg style={{ position: 'absolute', inset: 0, margin: 'auto', width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="templates-section" style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 className="section-label-mid" style={{ marginBottom: 0 }}>Typography</h3>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <button 
                            onClick={() => setShowFontDropdown(!showFontDropdown)}
                            style={{
                                width: '100%',
                                padding: '14px 20px',
                                background: '#f8fafc',
                                border: `2px solid ${showFontDropdown ? '#7c3aed' : '#e2e8f0'}`,
                                borderRadius: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{ 
                                fontFamily: `var(${RESUME_FONTS.find(f => f.name === settings.fontFamily)?.variable || '--font-inter'})`,
                                fontSize: '16px',
                                fontWeight: 600,
                                color: '#0f172a'
                            }}>
                                {settings.fontFamily}
                            </span>
                            <ChevronDown 
                                size={18} 
                                style={{ 
                                    transform: showFontDropdown ? 'rotate(180deg)' : 'rotate(0)', 
                                    transition: 'transform 0.2s', 
                                    color: '#7c3aed' 
                                }} 
                            />
                        </button>

                        {showFontDropdown && (
                            <div style={{ 
                                position: 'absolute',
                                top: 'calc(100% + 8px)',
                                left: 0,
                                right: 0,
                                zIndex: 100,
                                background: '#ffffff', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '16px',
                                padding: '16px',
                                maxHeight: '450px',
                                overflowY: 'auto',
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                                animation: 'fadeIn 0.2s ease-out'
                            }}>
                                {[
                                    { title: 'Professional Sans', type: 'sans' },
                                    { title: 'Elegant Serif', type: 'serif' },
                                    { title: 'Creative & Unique', type: 'creative' },
                                    { title: 'Monospace', type: 'mono' }
                                ].map(cat => (
                                    <div key={cat.type} style={{ marginBottom: '20px' }}>
                                        <p style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>{cat.title}</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '4px' }}>
                                            {RESUME_FONTS.filter(f => f.type === cat.type).map(f => (
                                                <button
                                                    key={f.name}
                                                    onClick={() => {
                                                        updateSetting('fontFamily', f.name);
                                                        setShowFontDropdown(false);
                                                    }}
                                                    style={{
                                                        padding: '10px 14px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        background: settings.fontFamily === f.name ? '#f5f3ff' : 'transparent',
                                                        border: `1.5px solid ${settings.fontFamily === f.name ? '#7c3aed' : 'transparent'}`,
                                                        borderRadius: '10px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.1s ease',
                                                        textAlign: 'left'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (settings.fontFamily !== f.name) e.currentTarget.style.background = '#f8fafc';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (settings.fontFamily !== f.name) e.currentTarget.style.background = 'transparent';
                                                    }}
                                                >
                                                    <span style={{ 
                                                        fontFamily: `var(${f.variable}), ${f.type === 'serif' ? 'serif' : 'sans-serif'}`,
                                                        fontSize: '15px', 
                                                        color: settings.fontFamily === f.name ? '#7c3aed' : '#1e293b',
                                                        fontWeight: settings.fontFamily === f.name ? 600 : 400
                                                    }}>
                                                        {f.name}
                                                    </span>
                                                    {settings.fontFamily === f.name && (
                                                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Check size={10} color="white" strokeWidth={4} />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="templates-section" style={{ marginBottom: '32px' }}>
                    <h3 className="section-label-mid">Layout Sizing</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[
                            { label: 'Small', val: 0.85, iconSize: '12px' },
                            { label: 'Normal', val: 1, iconSize: '16px' },
                            { label: 'Large', val: 1.15, iconSize: '20px' }
                        ].map(opt => (
                            <button key={opt.label} onClick={() => updateSetting('fontSize', opt.val)} style={{ flex: 1, padding: '12px', background: settings.fontSize === opt.val ? '#eff6ff' : 'white', border: `1px solid ${settings.fontSize === opt.val ? '#3b82f6' : '#e2e8f0'}`, borderRadius: '0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                                <span style={{ fontSize: opt.iconSize, fontWeight: 700, color: settings.fontSize === opt.val ? '#7c3aed' : '#0f172a' }}>A</span>
                                <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="templates-section">
                    <h3 className="section-label-mid">Adjust Spacing</h3>
                    {[
                        { key: 'sectionSpacing', label: 'Section Spacing' },
                        { key: 'paragraphSpacing', label: 'Paragraph Spacing' },
                        { key: 'lineHeight', label: 'Line Height' },
                        { key: 'letterSpacing', label: 'Letter Spacing' },
                        { key: 'pageMargin', label: 'Page Margins' }
                    ].map(item => {
                        const defVal = templateConfig?.defaults?.[item.key] || (item.key === 'lineHeight' ? 1.5 : (item.key === 'pageMargin' ? 40 : 1));
                        const currentVal = settings[item.key] || defVal;
                        let sliderVal = item.key === 'pageMargin' ? (currentVal / 40) * 50 : (currentVal / defVal) * 50;

                        return (
                            <div key={item.key} style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{item.label}</label>
                                    <span style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 800 }}>{Math.round(sliderVal * 2)}%</span>
                                </div>
                                <input type="range" min="0.5" max="100" step="0.5" value={sliderVal} onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    const newVal = item.key === 'pageMargin' ? (val / 50) * 40 : (val / 50) * defVal;
                                    updateSetting(item.key, newVal);
                                }} style={{ width: '100%', accentColor: '#7c3aed', height: '4px', background: '#e2e8f0', borderRadius: '0', outline: 'none', cursor: 'pointer' }} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
