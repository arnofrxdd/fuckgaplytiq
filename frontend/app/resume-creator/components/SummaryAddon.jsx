import React, { useState } from 'react';
import { Sparkles, PenTool, Loader2, X } from 'lucide-react';
import { fetchAuthenticatedAI } from "../utils/aiApi";
import { Editor, EditorProvider, Toolbar, BtnBold, BtnItalic, BtnUnderline, BtnBulletList } from 'react-simple-wysiwyg';
import './SummaryAddon.css';

export default function SummaryAddon({ data, setData, onBack, onNext }) {
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const [summaryOptions, setSummaryOptions] = useState([]);
    const [summaryMode, setSummaryMode] = useState('create');

    const handleSummaryChange = (e) => {
        setData({ ...data, summary: e.target.value });
    };

    const handleSummaryAI = async (mode) => {
        const currentSummary = data.summary ? data.summary.replace(/<[^>]*>?/gm, '').trim() : "";
        const jobTitle = data.personal?.profession || "";

        if (mode === 'create' && !jobTitle) {
            alert("Please ensure you have entered a 'Job Title' in the Header section first.");
            return;
        }
        if (mode === 'improve' && (!currentSummary || currentSummary.length < 10)) {
            alert("Please write a draft summary first to enhance.");
            return;
        }

        setIsSummaryLoading(true);
        setSummaryOptions([]);
        setShowSummaryModal(true);
        setSummaryMode(mode);

        try {
            const response = await fetchAuthenticatedAI('/resumy/api/generate-summary', {
                method: 'POST',
                body: JSON.stringify({ jobTitle, existingSummary: currentSummary, type: mode })
            });
            const res = await response.json();
            if (res.summaries) setSummaryOptions(res.summaries);
        } catch (error) {
            console.error("Summary AI Error:", error);
            // Fallback mock data if server is down just for testing
            setSummaryOptions([
                "An experienced professional with a proven track record of success in " + (jobTitle || "the industry") + ".",
                "Results-oriented " + (jobTitle || "expert") + " dedicated to driving business growth and leading cross-functional teams."
            ]);
        } finally {
            setIsSummaryLoading(false);
        }
    };

    const applySummaryOption = (text) => {
        setData({ ...data, summary: text });
        setShowSummaryModal(false);
    };

    return (
        <div className="zety-fade-in summary-addon-wrapper">
            <div className="zety-header">
                <h1 className="zety-title">Profile Summary (Add-on)</h1>
                <p className="zety-subtitle">A brief overview of your professional background and goals.</p>
            </div>

            <div className="summary-card">
                <div className="summary-header-actions">
                    <span className="zety-label">Your Summary</span>
                    <div className="ai-buttons-group">
                        <button className="ai-btn create" onClick={() => handleSummaryAI('create')}>
                            <Sparkles size={14} strokeWidth={2.5} /> Create with AI
                        </button>
                        <button className="ai-btn enhance" onClick={() => handleSummaryAI('improve')}>
                            <PenTool size={14} strokeWidth={2.5} /> Enhance with AI
                        </button>
                    </div>
                </div>

                <div className="summary-editor-container">
                    <EditorProvider>
                        <Editor
                            value={data.summary || ""}
                            onChange={handleSummaryChange}
                            containerProps={{ className: 'wysiwyg-wrapper' }}
                        >
                            <Toolbar>
                                <BtnBold />
                                <BtnItalic />
                                <BtnUnderline />
                                <BtnBulletList />
                            </Toolbar>
                        </Editor>
                    </EditorProvider>
                </div>
            </div>

            <div className="zety-footer">
                <button className="zety-btn-back" onClick={onBack}>Back: Skills</button>
                <button className="zety-btn-next" onClick={onNext}>Next: Finalize</button>
            </div>

            {/* AI Summary Results Modal */}
            {showSummaryModal && (
                <div className="ai-modal-overlay" onClick={() => setShowSummaryModal(false)}>
                    <div className="ai-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="ai-modal-header">
                            <h3>{summaryMode === 'create' ? 'AI Generated Summaries' : 'AI Enhanced Summaries'}</h3>
                            <button className="close-ai-btn" onClick={() => setShowSummaryModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="ai-modal-body">
                            {isSummaryLoading ? (
                                <div className="loading-state">
                                    <Loader2 className="spinner" size={32} />
                                    <p>Generating the perfect summary...</p>
                                </div>
                            ) : (
                                <div className="options-list">
                                    {summaryOptions.map((opt, idx) => (
                                        <div key={idx} className="summary-option-card">
                                            <p>{opt}</p>
                                            <button
                                                className="btn-apply-summary"
                                                onClick={() => applySummaryOption(opt)}
                                            >
                                                Use This
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}