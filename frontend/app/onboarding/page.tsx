'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseClient } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/authContext';
import ReactMarkdown from 'react-markdown';
import './onboarding.css';

interface Profile {
  name: string;
  jobTitle: string;
  experienceLevel: string;
  primaryGoal: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { userId, userEmail, isAuthenticated, isLoading } = useAuth();

  const [currentAriaText, setCurrentAriaText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeChoices, setActiveChoices] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [inputText, setInputText] = useState('');
  const [profile, setProfile] = useState<Profile>({
    name: '',
    jobTitle: '',
    experienceLevel: '',
    primaryGoal: '',
  });
  const [isCompleting, setIsCompleting] = useState(false);

  const historyRef = useRef<{ role: string; content: string }[]>([]);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!userId || !isAuthenticated) return;

    const hydrateProfile = async () => {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('career_dna')
        .eq('id', userId)
        .single();

      if (error || !data?.career_dna) return;

      let dna = data.career_dna;
      if (typeof dna === 'string') {
        try {
          dna = JSON.parse(dna);
        } catch {
          return;
        }
      }

      setProfile(prev => ({
        ...prev,
        name: dna?.personal?.name || dna?.name || prev.name,
        jobTitle: dna?.personal?.profession || dna?.jobTitle || prev.jobTitle,
        experienceLevel: dna?.experienceLevel || prev.experienceLevel,
        primaryGoal: dna?.primaryGoal || prev.primaryGoal,
      }));
    };

    hydrateProfile().catch(err => {
      console.warn('Failed to hydrate onboarding profile', err);
    });
  }, [userId, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || hasStarted.current) return;
    hasStarted.current = true;
    const initialName = userEmail?.split('@')[0] || '';
    sendCommand(`[System: New user session. Greet them warmly and propose the name "${initialName}" for confirmation.]`);
  }, [isAuthenticated, userEmail]);

  const sendCommand = async (text: string) => {
    if (!text.trim() || isTyping) return;

    setActiveChoices([]);
    setShowChat(false);
    setInputText('');
    setIsTyping(true);
    setCurrentAriaText('');

    const userEntry = { role: 'user', content: text };
    historyRef.current = [...historyRef.current, userEntry];

    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const response = await fetch(`${backendUrl}/api/aria/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          message: text,
          context: {
            currentRoute: '/onboarding',
            profile,
            email: userEmail,
          },
          history: historyRef.current.slice(-12),
          stream: true,
        }),
      });

      if (!response.ok) throw new Error('Aria error');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      while (true) {
        const { value, done } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const dataStr = line.replace('data: ', '').trim();
          if (dataStr === '[DONE]') continue;

          try {
            const data = JSON.parse(dataStr);

            if (data.type === 'text_chunk') {
              assistantText += data.content;
              setCurrentAriaText(assistantText);
            } else if (data.type === 'widget_chunk') {
              if (data.choices !== undefined) setActiveChoices(data.choices);
              if (data.showChatbox !== undefined) setShowChat(data.showChatbox);
            } else if (data.type === 'profile_chunk') {
              setProfile(prev => ({
                ...prev,
                ...(data.name && { name: data.name }),
                ...(data.jobTitle && { jobTitle: data.jobTitle }),
                ...(data.experienceLevel && { experienceLevel: data.experienceLevel }),
                ...(data.primaryGoal && { primaryGoal: data.primaryGoal }),
              }));
            } else {
              handleFinalResponse(data);
            }
          } catch {
            // Ignore malformed chunk
          }
        }
      }

      if (assistantText) {
        historyRef.current = [...historyRef.current, { role: 'assistant', content: assistantText }];
      }

      setIsTyping(false);
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setCurrentAriaText('Something went wrong. Please try again.');
    }
  };

  const handleFinalResponse = (data: any) => {
    if (!data) return;

    if (data.type === 'tool_call') {
      const tool = data.tool;
      const args = data.args || {};

      if (tool === 'update_profile' || tool === 'show_widget') {
        const incomingProfile = {
          ...(args.profile || {}),
          ...(args.name ? { name: args.name } : {}),
          ...(args.jobTitle ? { jobTitle: args.jobTitle } : {}),
          ...(args.experienceLevel ? { experienceLevel: args.experienceLevel } : {}),
          ...(args.primaryGoal ? { primaryGoal: args.primaryGoal } : {}),
        };
        if (Object.keys(incomingProfile).length > 0) {
          setProfile(prev => ({
            ...prev,
            ...incomingProfile,
          }));
        }

        const choices = args.choices ?? [];
        const shouldShowChat = args.showChatbox ?? (choices.length === 0);
        setActiveChoices(choices);
        setShowChat(shouldShowChat);
      }

      if (tool === 'request_text_input') {
        setActiveChoices([]);
        setShowChat(true);
      }

      if (tool === 'finish_onboarding') {
        setActiveChoices([]);
        setShowChat(false);
        setCurrentAriaText("You're all set. Taking you to your dashboard.");
        setIsCompleting(true);
        setTimeout(() => router.push('/dashboard'), 2200);
      }
    } else if (data.type === 'text') {
      setShowChat(true);
    }
  };

  return (
    <div className="onboarding-page">
      <AnimatePresence>
        {isCompleting && (
          <motion.div
            className="onboarding-complete-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="onboarding-complete-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <div className="onboarding-complete-title">You&apos;re all set</div>
              <div className="onboarding-complete-sub">Opening your dashboard...</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="ob-grid" />

      <header className="ob-header">
        <div className="ob-logo">Gaply<span>tiq</span></div>
      </header>

      <main className="ob-setup-container">
        <div className="ob-content-wrap">
          <section className="aria-section">
            <div className="aria-orb-wrap">
              <div className="aria-orb">✦</div>
              <div className="aria-name">Aria AI</div>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentAriaText.slice(0, 40)}
                className="aria-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ReactMarkdown>
                  {currentAriaText || (isTyping ? '...' : '')}
                </ReactMarkdown>
              </motion.div>
            </AnimatePresence>
          </section>

          <section className="interaction-section">
            <AnimatePresence mode="wait">
              {!isTyping && activeChoices.length > 0 && (
                <motion.div
                  key="choices"
                  className="choice-container"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.12 }}
                >
                  {activeChoices.map((choice, i) => (
                    <button
                      key={i}
                      className="choice-btn"
                      onClick={() => sendCommand(choice)}
                    >
                      {choice}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {!isTyping && showChat && (
                <motion.div
                  key="chatbox"
                  className="input-wrap"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                >
                  <input
                    placeholder="Type your response..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && inputText.trim() && sendCommand(inputText)}
                    autoFocus
                  />
                  <button
                    className="send-btn"
                    onClick={() => inputText.trim() && sendCommand(inputText)}
                  >
                    Send
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        <section className="profile-card-section">
          <motion.div
            className="account-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="card-label">Identity</div>
            <div className="card-main">
              <div className="field">
                <span className="label">Full Name</span>
                <span className="value">{profile.name || '---'}</span>
              </div>
              <div className="field">
                <span className="label">Target Role</span>
                <span className="value">{profile.jobTitle || '---'}</span>
              </div>
              <div className="field">
                <span className="label">Experience</span>
                <span className="value capitalize">{profile.experienceLevel || '---'}</span>
              </div>
              <div className="field">
                <span className="label">Primary Goal</span>
                <span className="value">{profile.primaryGoal || '---'}</span>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
