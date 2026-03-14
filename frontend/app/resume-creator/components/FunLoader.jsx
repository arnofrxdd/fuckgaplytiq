"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Sparkles, Layout, Palette, PenTool } from 'lucide-react'

const FunLoader = ({ text }) => {
    const [subText, setSubText] = useState("Getting everything ready...")

    useEffect(() => {
        const professionalPhrases = [
            "Setting up your workspace...",
            "Applying your design...",
            "Organizing sections...",
            "Preparing the document...",
            "Optimizing the layout...",
            "Polishing details..."
        ]
        let i = 0
        const interval = setInterval(() => {
            setSubText(professionalPhrases[i % professionalPhrases.length])
            i++
        }, 2500)
        return () => clearInterval(interval)
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] bg-white/95 backdrop-blur-2xl flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Soft Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-50/50 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-50/50 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-8">
                {/* Minimalist Document Loading Visual */}
                <div className="relative mb-16">
                    {/* The "Primary Document" Shape */}
                    <motion.div
                        animate={{ 
                            y: [0, -8, 0],
                            rotateZ: [-0.5, 0.5, -0.5] 
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-24 h-32 bg-white border border-stone-200 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col p-4 relative"
                    >
                        {/* Abstract Resume Content Lines */}
                        <div className="w-8 h-1.5 bg-stone-100 rounded-full mb-4" />
                        <div className="space-y-2">
                            <div className="w-full h-1 bg-stone-50 rounded-full" />
                            <div className="w-full h-1 bg-stone-50 rounded-full" />
                            <div className="w-2/3 h-1 bg-stone-50 rounded-full" />
                        </div>
                        <div className="mt-6 space-y-2">
                            <div className="w-full h-1 bg-stone-50 rounded-full" />
                            <div className="w-3/4 h-1 bg-stone-50 rounded-full" />
                        </div>

                        {/* Infinite Orbiting Icons (The "Activities") */}
                        <div className="absolute inset-0">
                            {[
                                { Icon: Layout, delay: 0, color: 'text-indigo-500' },
                                { Icon: Palette, delay: 1, color: 'text-emerald-500' },
                                { Icon: PenTool, delay: 2, color: 'text-rose-500' }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    className={`absolute -inset-4 flex items-center justify-center pointer-events-none`}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: item.delay }}
                                >
                                    <motion.div 
                                        className={`w-10 h-10 bg-white border border-stone-100 shadow-lg rounded-xl flex items-center justify-center ${item.color}`}
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: item.delay }}
                                        style={{ translate: '60px' }}
                                    >
                                        <item.Icon size={18} strokeWidth={2.5} />
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Subtle Pulsing Shadow */}
                    <motion.div 
                        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-stone-900/10 blur-md rounded-full -z-10"
                    />
                </div>

                {/* Typography: Professional & Clean */}
                <div className="text-center space-y-3">
                    <h2 className="text-2xl font-black text-stone-900 tracking-tight leading-tight">
                        {text || "Getting Started"}
                    </h2>
                    
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={subText}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="flex items-center justify-center gap-2"
                        >
                            <span className="text-stone-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                                {subText}
                            </span>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Clean Infinite Loader - Circular Progress synced with other loaders */}
                <div className="mt-10 relative">
                    <svg className="w-8 h-8 rotate-[-90deg]">
                        <circle
                            cx="16"
                            cy="16"
                            r="14"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="transparent"
                            className="text-stone-100"
                        />
                        <motion.circle
                            cx="16"
                            cy="16"
                            r="14"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="transparent"
                            strokeDasharray="88"
                            initial={{ strokeDashoffset: 88 }}
                            animate={{ strokeDashoffset: [88, 0, -88] }}
                            transition={{ 
                                duration: 2, 
                                repeat: Infinity, 
                                ease: "easeInOut" 
                            }}
                            className="text-stone-900"
                        />
                    </svg>
                </div>
            </div>

            {/* Mobile Footer Message (Subtle) */}
            <div className="absolute bottom-12 left-0 w-full text-center px-6">
                <p className="text-[10px] text-stone-400 font-medium tracking-wide">
                    This usually takes a few seconds
                </p>
            </div>
        </motion.div>
    )
}

export default FunLoader
