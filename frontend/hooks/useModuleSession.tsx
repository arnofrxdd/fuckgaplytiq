"use client"

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { startModuleSession, stopModuleSession, getStoredSessionId, clearStoredSessionId } from '../lib/moduleSessionClient'

// Keep simple mapping of pathname -> moduleName. Use top-level segment or 'home'.
function computeModuleName(pathname: string | null) {
    if (!pathname || pathname === '/') return 'home'
    const parts = pathname.split('/').filter(Boolean)
    return parts.length === 0 ? 'home' : parts[0]
}

export default function useModuleSession(user: { id?: string } | null) {
    const pathname = usePathname()
    const currentSessionRef = useRef<string | null>(null)
    const lastModuleRef = useRef<string | null>(null)
    const stoppingRef = useRef(false)

    // Attempt to initialize existing session id from localStorage
    useEffect(() => {
        const stored = getStoredSessionId()
        if (stored) currentSessionRef.current = stored
    }, [])

    // Start / stop based on auth state
    useEffect(() => {
        async function startIfNeeded() {
            if (!user) return
            const moduleName = computeModuleName(pathname)
            // If a session already exists, ensure module tracked is up-to-date
            if (currentSessionRef.current && lastModuleRef.current === moduleName) return

            try {
                const sessionId = await startModuleSession(moduleName)
                currentSessionRef.current = sessionId
                lastModuleRef.current = moduleName
            } catch (err) {
                // 401 errors are expected when auth isn't ready yet - silently ignore
                // Other errors indicate actual problems with the session service
                if (err instanceof Error && !err.message.includes('401')) {
                    console.error('Failed to start module session:', err.message)
                }
            }
        }

        async function stopIfNeeded() {
            if (!currentSessionRef.current) return
            try {
                const id = currentSessionRef.current
                stoppingRef.current = true
                await stopModuleSession(id)
            } catch (err) {
                // 401 errors are expected when auth isn't ready - silently ignore
                if (err instanceof Error && !err.message.includes('401')) {
                    console.error('Failed to stop session:', err.message)
                }
            } finally {
                stoppingRef.current = false
                currentSessionRef.current = null
                lastModuleRef.current = null
                clearStoredSessionId()
            }
        }

        if (user) {
            // user logged in: start session for the current route
            startIfNeeded()
        } else {
            // user logged out: stop any active session
            stopIfNeeded()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    // react to pathname (module) changes while logged-in
    useEffect(() => {
        if (!user) return
        const newModule = computeModuleName(pathname)
        // If same module, do nothing
        if (newModule === lastModuleRef.current) return

        let didCancel = false

        async function shiftSession() {
            const prevId = currentSessionRef.current
            try {
                if (prevId) {
                    await stopModuleSession(prevId)
                }
            } catch (err) {
                console.warn('Failed to stop previous module session', err)
            } finally {
                if (!didCancel) {
                    currentSessionRef.current = null
                    lastModuleRef.current = null
                    // start a new session for the new module
                    try {
                        const sessionId = await startModuleSession(newModule)
                        currentSessionRef.current = sessionId
                        lastModuleRef.current = newModule
                    } catch (err) {
                        console.warn('Failed to start new module session', err)
                    }
                }
            }
        }

        shiftSession()

        return () => { didCancel = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname])

    // Stop session on page hide/unload (user leaves the site)
    useEffect(() => {
        if (!user) return

        let didCancel = false

        const stopNow = async () => {
            if (stoppingRef.current) return
            const id = currentSessionRef.current
            if (!id) return
            try {
                stoppingRef.current = true
                await stopModuleSession(id)
            } catch (err) {
                console.warn('Failed to stop session on unload/visibility', err)
            } finally {
                stoppingRef.current = false
                currentSessionRef.current = null
                lastModuleRef.current = null
                clearStoredSessionId()
                didCancel = true
            }
        }

        const onVisibility = () => {
            if (document.visibilityState === 'hidden') stopNow()
        }

        const onUnload = () => {
            // best effort stop
            stopNow()
        }

        window.addEventListener('visibilitychange', onVisibility)
        window.addEventListener('pagehide', onUnload)
        window.addEventListener('beforeunload', onUnload)

        return () => {
            if (!didCancel) {
                // ensure we don't leak
            }
            window.removeEventListener('visibilitychange', onVisibility)
            window.removeEventListener('pagehide', onUnload)
            window.removeEventListener('beforeunload', onUnload)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])
}
