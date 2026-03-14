import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Sparkles, Shield, Rocket, Target } from 'lucide-react';
import './FAQSection.css';

const FAQ_DATA = [
  {
    question: "How does the AI Resume Builder work?",
    answer: "Our AI analyzes your professional background and job targets to suggest high-impact bullet points, optimize your summary, and ensure your layout is ATS-friendly. It's like having a professional career coach guiding you through every step.",
    icon: <Sparkles className="w-5 h-5 text-emerald-500" />
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use industry-standard encryption and secure Supabase authentication to protect your information. Your data is private and only used to help you build your resume. We never sell your personal information.",
    icon: <Shield className="w-5 h-5 text-blue-500" />
  },
  {
    question: "Can I import my existing resume?",
    answer: "Yes! You can upload your current resume in PDF or Word format. Our AI will extract your information and map it into our modern templates, saving you hours of manual data entry.",
    icon: <Rocket className="w-5 h-5 text-orange-500" />
  },
  {
    question: "What is 'Career DNA'?",
    answer: "Career DNA is your unique professional blueprint stored in our system. Once you build or import your profile, we 'encode' it so you can generate multiple tailored resumes for different roles instantly without starting from scratch.",
    icon: <Target className="w-5 h-5 text-purple-500" />
  }
];

const FAQItem = ({ question, answer, icon, isOpen, onClick }) => {
  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`}>
      <button className="faq-question" onClick={onClick}>
        <div className="faq-question-content">
          <span className="faq-icon-wrapper">{icon}</span>
          <span className="faq-text">{question}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-stone-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="faq-answer-wrapper"
          >
            <div className="faq-answer">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="faq-section" id="faq-section">
      <div className="faq-container">
        <div className="faq-header">
          <div className="faq-badge">
            <HelpCircle className="w-4 h-4" />
            <span>Got Questions?</span>
          </div>
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <p className="faq-subtitle">
            Everything you need to know about building your professional future with Resumy.
          </p>
        </div>

        <div className="faq-list">
          {FAQ_DATA.map((item, index) => (
            <FAQItem
              key={index}
              {...item}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
