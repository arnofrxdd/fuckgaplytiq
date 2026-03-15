/* OnboardingGuide.jsx */
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Eye, Check, X, Layout, Edit3, Move, Sparkles, Plus, Sliders } from 'lucide-react';
import "./OnboardingGuide.css";

const editorSteps = [
    {
        id: 'nav',
        title: 'Navigation',
        content: 'Jump between sections easily using the sidebar. Your progress is saved automatically!',
        icon: Navigation,
        targetPC: '.nav-items-container',
        targetMobile: '.menu-btn',
        posPC: 'right',
        posMobile: 'bottom'
    },
    {
        id: 'preview',
        title: 'Live Preview',
        content: 'See your resume update in real-time. Click to view it in full screen!',
        icon: Eye,
        targetPC: '.preview-card',
        targetMobile: '.preview-btn',
        posPC: 'left',
        posMobile: 'bottom'
    }
];

const finalizeSteps = [
    {
        id: 'reorder',
        title: 'Your Resume',
        contentPC: 'This is your resume! Hover any section to see drag handles and move them around.',
        contentMobile: 'This is your resume! Hold down any section to reorder them exactly how you like.',
        icon: Move,
        targetPC: '.dashboard-preview-area',
        targetMobile: '.preview-container',
        posPC: 'bottom',
        posMobile: 'top'
    },
    {
        id: 'templates',
        title: 'Choose Templates',
        content: 'Wanna try a different look? Pick from dozens of premium templates right here!',
        icon: Layout,
        targetPC: '.dashboard-config-pane',
        targetMobile: '.nav-btn',
        posPC: 'right',
        posMobile: 'top'
    },
    {
        id: 'design',
        title: 'Design & Style',
        content: 'Fine-tune your colors, fonts, and spacing here to give your resume a premium feel.',
        icon: Sliders,
        targetPC: '.dashboard-config-pane',
        targetMobile: '.mobile-bottom-nav .nav-btn:nth-child(2)',
        posPC: 'right',
        posMobile: 'top'
    },
    {
        id: 'add-section',
        title: 'Add Sections',
        content: 'Missed something? Use this panel to add extra sections or custom content blocks.',
        icon: Plus,
        targetPC: '.dashboard-config-pane',
        targetMobile: '.mobile-bottom-nav .nav-btn:nth-child(3)',
        posPC: 'right',
        posMobile: 'top'
    },
    {
        id: 'edit',
        title: 'Back to Editor',
        content: 'Need to tweak content? Jump back to the professional editor at any time.',
        icon: Edit3,
        targetPC: '.editor-back-btn',
        targetMobile: '.editor-back-btn',
        posPC: 'bottom',
        posMobile: 'bottom'
    },
    {
        id: 'export',
        title: 'Export Ready',
        content: 'All set? Hit export to grab your high-quality PDF and start applying!',
        icon: Sparkles,
        targetPC: '.dashboard-right-actions',
        targetMobile: '.mobile-bottom-nav .nav-btn:nth-child(4)',
        posPC: 'left',
        posMobile: 'top'
    }
];

export default function OnboardingGuide({ isMobile, resumeId, scene = 'editor', metadata = null, onUpdateMetadata = null, onStepChange = null, onComplete = null }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [targetRect, setTargetRect] = useState(null);
    const [isMounted, setIsMounted] = useState(false);

    const steps = scene === 'editor' ? editorSteps : finalizeSteps;

    useEffect(() => {
        setIsMounted(true);

        // Priority 1: Use Database Metadata
        if (metadata && !isVisible) {
            if (scene === 'editor' && !metadata.editor_tour_completed) {
                setTimeout(() => setIsVisible(true), 1500);
            } else if (scene === 'finalize' && (metadata.finalize_tour_step === undefined || metadata.finalize_tour_step < steps.length)) {
                setCurrentStep(metadata.finalize_tour_step || 0);
                setTimeout(() => setIsVisible(true), 1500);
            }
            return;
        }

        // Priority 2: Use LocalStorage for guests or fallback
        if (!isVisible) {
            const hasSeen = localStorage.getItem(`onboarding_seen_${scene}_${resumeId}_v3`);
            if (!hasSeen) {
                setTimeout(() => setIsVisible(true), 1500);
            }
        }
    }, [resumeId, scene, metadata, steps.length, isVisible]);

    // Notify on step change
    useEffect(() => {
        if (isVisible && steps[currentStep] && onStepChange) {
            onStepChange(steps[currentStep]);
        }
    }, [currentStep, isVisible, onStepChange, steps]);

    useEffect(() => {
        if (!isVisible || !isMounted || !steps.length) return;

        const updateRect = () => {
            const step = steps[currentStep];
            if (!step) return;

            const selector = isMobile ? (step.targetMobile || step.targetPC) : step.targetPC;
            const element = document.querySelector(selector);

            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    setTargetRect({
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height
                    });
                }
            } else {
                setTargetRect(null);
            }
        };

        updateRect();
        window.addEventListener('resize', updateRect);
        const interval = setInterval(updateRect, 300); // Faster polling for smoother transitions

        return () => {
            window.removeEventListener('resize', updateRect);
            clearInterval(interval);
        };
    }, [currentStep, isVisible, isMobile, isMounted, steps]);

    const handleNext = () => {
        const nextStepIdx = currentStep + 1;

        if (nextStepIdx < steps.length) {
            setCurrentStep(nextStepIdx);

            // Sync progress to DB if available
            if (onUpdateMetadata) {
                if (scene === 'finalize') {
                    onUpdateMetadata({ finalize_tour_step: nextStepIdx });
                }
            }
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        setIsVisible(false);

        if (onUpdateMetadata) {
            if (scene === 'editor') onUpdateMetadata({ editor_tour_completed: true });
            if (scene === 'finalize') onUpdateMetadata({ finalize_tour_step: steps.length });
        }

        localStorage.setItem(`onboarding_seen_${scene}_${resumeId}_v3`, 'true');
        if (onComplete) onComplete();
    };

    if (!isVisible || !targetRect) return null;

    const step = steps[currentStep];
    if (!step) return null;
    const Icon = step.icon;

    const getTooltipStyles = () => {
        const padding = 24;
        const width = isMobile ? 240 : 320;
        const estHeight = 180;

        let pos = isMobile ? step.posMobile : step.posPC;
        let top = 0, left = 0;
        let side = pos;

        if (pos === 'right') {
            top = targetRect.top;
            left = targetRect.left + targetRect.width + padding;
            if (left + width > window.innerWidth) {
                left = targetRect.left - width - padding;
                side = 'left';
            }
        } else if (pos === 'left') {
            top = targetRect.top;
            left = targetRect.left - width - padding;
            if (left < 10) {
                left = targetRect.left + targetRect.width + padding;
                side = 'right';
            }
        } else if (pos === 'bottom') {
            top = targetRect.top + targetRect.height + padding;
            left = targetRect.left + (targetRect.width / 2) - (width / 2);
            if (top + estHeight > window.innerHeight) {
                top = targetRect.top - estHeight - padding;
                side = 'top';
            }
        } else if (pos === 'top') {
            top = targetRect.top - estHeight - padding;
            left = targetRect.left + (targetRect.width / 2) - (width / 2);
            if (top < 10) {
                top = targetRect.top + targetRect.height + padding;
                side = 'bottom';
            }
        }

        // --- GLOBAL CLAMPING & ARROW OFFSET ---
        const safeMargin = 12;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const finalTop = Math.max(safeMargin, Math.min(viewportHeight - estHeight - safeMargin, top));
        const finalLeft = Math.max(safeMargin, Math.min(viewportWidth - width - safeMargin, left));

        // Calculate arrow offset relative to the tooltip card
        let arrowOffset = 20; // Default
        if (side === 'top' || side === 'bottom') {
            const targetCenterX = targetRect.left + targetRect.width / 2;
            arrowOffset = targetCenterX - finalLeft;
            // Clamp to avoid corners
            arrowOffset = Math.max(20, Math.min(width - 20, arrowOffset));
        } else {
            const targetCenterY = targetRect.top + targetRect.height / 2;
            arrowOffset = targetCenterY - finalTop;
            // Clamp to avoid corners
            arrowOffset = Math.max(20, Math.min(estHeight - 20, arrowOffset));
        }

        return { top: finalTop, left: finalLeft, side, arrowOffset };
    };

    const tooltipPos = getTooltipStyles();

    return (
        <div className="ftux-overlay" style={{ pointerEvents: 'none' }}>
            <motion.div
                className="ftux-highlight"
                animate={{
                    top: targetRect.top - 8,
                    left: targetRect.left - 8,
                    width: targetRect.width + 16,
                    height: targetRect.height + 16
                }}
                transition={{ type: 'spring', damping: 20, stiffness: 150 }}
            />

            <motion.div
                className={`ftux-step ${tooltipPos.side}`}
                style={{
                    pointerEvents: 'auto',
                    position: 'absolute',
                    top: tooltipPos.top,
                    left: tooltipPos.left,
                    width: isMobile ? 240 : 320,
                    zIndex: 10001,
                    '--arrow-offset': `${tooltipPos.arrowOffset}px`
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
            >
                <div className="ftux-card">
                    <div className="ftux-header">
                        <div className={`ftux-icon-box ${step.id}`}>
                            <Icon size={16} strokeWidth={2.5} />
                        </div>
                        <span className="ftux-title">{step.title}</span>
                        <button className="ftux-close-btn" onClick={handleComplete}>
                            <X size={14} />
                        </button>
                    </div>
                    <p className="ftux-body">
                        {isMobile ? (step.contentMobile || step.content) : (step.contentPC || step.content)}
                    </p>
                    <div className="ftux-footer">
                        <button className="ftux-next-btn" onClick={handleNext}>
                            {currentStep < steps.length - 1 ? 'Next' : 'Finish Tour'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
