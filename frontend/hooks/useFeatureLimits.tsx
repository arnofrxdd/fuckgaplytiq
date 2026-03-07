/**
 * useFeatureLimits Hook
 * Provides feature usage tracking and access control
 */

'use client'

import { useCallback, useState, useEffect } from 'react'
import { FeatureType, PlanType, PLAN_LIMITS } from '../lib/featureLimits'
import { supabaseClient } from '@/lib/supabaseClient'

export interface UpgradePromptInfo {
    feature: FeatureType
    currentLimit: number
    planRequired: 'basic' | 'pro'
}

export interface UseFeatureLimitsReturn {
    canUseFeature: (feature: FeatureType) => boolean
    getFeatureInfo: (feature: FeatureType) => {
        remaining: number
        limit: number
        nearLimit: boolean
    }
    getFeatureUsage: (feature: FeatureType) => number
    trackFeatureUsage: (feature: FeatureType) => void
    showUpgradePrompt: (feature: FeatureType) => void
    upgradePending: UpgradePromptInfo | null
    dismissUpgrade: () => void
}

/**
 * Hook for managing feature usage and limits
 */
export const useFeatureLimits = (
    userId: string | undefined,
    userPlan: PlanType | undefined
): UseFeatureLimitsReturn => {
    const [upgradePending, setUpgradePending] = useState<UpgradePromptInfo | null>(null)
    const [isMounted, setIsMounted] = useState(false)
    const [featureUsage, setFeatureUsage] = useState<Record<FeatureType, number>>({
        resumeBuilds: 0,
        jdMatching: 0,
        roadmaps: 0,
        skillTests: 0,
        skillGapAnalysis: 0,
        saves: 0,
        downloads: 0,
        aiSuggestions: 0,
    })

    // Fetch feature usage from backend on mount
    useEffect(() => {
        setIsMounted(true)

        if (!userId || !userPlan) return

        const fetchUsage = async () => {
            try {
                const { data: { session } } = await supabaseClient.auth.getSession()
                if (!session?.access_token) {
                    // Silently return - user not authenticated yet
                    return
                }

                const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
                const response = await fetch(`${apiUrl}/api/user/feature-usage`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json',
                    },
                })

                if (response.ok) {
                    const usage = await response.json()
                    setFeatureUsage({
                        resumeBuilds: usage.resumeBuilds || 0,
                        jdMatching: usage.jdMatching || 0,
                        roadmaps: usage.roadmapGenerations || 0,
                        skillTests: usage.skillTests || 0,
                        skillGapAnalysis: usage.skillGapAnalysis || 0,
                        saves: usage.saves || 0,
                        downloads: usage.downloads || 0,
                        aiSuggestions: usage.aiSuggestions || 0,
                    })
                } else if (response.status !== 401) {
                    // Only log non-401 errors (401 is expected when token expires/is invalid)
                    const errorData = await response.text()
                    console.debug('Feature usage fetch error:', { status: response.status, error: errorData })
                }
                // 401 errors are silently ignored - user will work with optimistic checks
            } catch (error) {
                // Network errors silently continue - allows optimistic feature access
            }
        }

        fetchUsage()
    }, [userId, userPlan])

    const canUseFeature = useCallback((feature: FeatureType): boolean => {
        // Development mode bypass - set NEXT_PUBLIC_DEV_MODE=true in .env.local
        if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
            console.debug(`canUseFeature(${feature}): Dev mode, unlimited access`)
            return true
        }

        if (!userId || !userPlan) {
            console.debug(`canUseFeature(${feature}): No userId/userPlan`)
            return false
        }

        // Pro plan has unlimited access
        if (userPlan === 'pro') {
            console.debug(`canUseFeature(${feature}): Pro plan, allowed`)
            return true
        }

        // If not mounted yet, be optimistic and allow (backend will enforce)
        if (!isMounted) {
            console.debug(`canUseFeature(${feature}): Not mounted yet, allowing optimistically`)
            return true
        }

        const limit = PLAN_LIMITS[userPlan][feature]
        const used = featureUsage[feature] || 0
        const remaining = Math.max(0, limit - used)

        const allowed = remaining > 0
        console.debug(`canUseFeature(${feature}): plan=${userPlan}, limit=${limit}, used=${used}, remaining=${remaining}, allowed=${allowed}`)

        return allowed
    }, [userId, userPlan, isMounted, featureUsage])

    const getFeatureInfo = useCallback((feature: FeatureType) => {
        if (!userId || !userPlan || !isMounted) {
            return { remaining: 0, limit: 0, nearLimit: false }
        }

        const limit = PLAN_LIMITS[userPlan][feature]
        const used = featureUsage[feature] || 0
        const remaining = Math.max(0, limit - used)

        return {
            remaining,
            limit: limit === Infinity ? 0 : limit,
            nearLimit: remaining === 1 && limit !== Infinity,
        }
    }, [userId, userPlan, isMounted, featureUsage])

    const getFeatureUsage = useCallback((feature: FeatureType): number => {
        return featureUsage[feature] || 0
    }, [featureUsage])

    const trackFeatureUsage = useCallback((feature: FeatureType): void => {
        if (!userId || !userPlan || !isMounted) return

        // Check if limit would be exceeded
        const limit = PLAN_LIMITS[userPlan][feature]
        const used = featureUsage[feature] || 0

        if (used >= limit) {
            showUpgradePrompt(feature)
        }
    }, [userId, userPlan, isMounted, featureUsage])

    const showUpgradePrompt = useCallback((feature: FeatureType): void => {
        const planRequired = userPlan === 'free' ? 'basic' : 'pro'
        console.debug(`showUpgradePrompt(${feature}): Showing upgrade modal for plan=${userPlan}, requires=${planRequired}`)

        setUpgradePending({
            feature,
            currentLimit: 0,
            planRequired,
        })
    }, [userPlan])

    const dismissUpgrade = useCallback((): void => {
        setUpgradePending(null)
    }, [])

    return {
        canUseFeature,
        getFeatureInfo,
        getFeatureUsage,
        trackFeatureUsage,
        showUpgradePrompt,
        upgradePending,
        dismissUpgrade,
    }
}
