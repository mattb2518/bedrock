'use client'

// §22d.2 AddressAutocomplete — shared address entry for quiz, your-ballot,
// and beyond-your-ballot. Accessible combobox pattern; 300ms debounce; min 3 chars.
// Uses suggestion.placePrediction.text.text ONLY — no Place Details calls.
// Manual-entry fallback on proxy error/empty result.

import { useState, useRef, useEffect, useId, useCallback } from 'react'

interface Suggestion {
  placePrediction?: {
    text?: { text?: string }
  }
}

export interface AddressAutocompleteProps {
  /** Called with the formatted address string when user selects or submits */
  onSelect: (formattedAddress: string) => void
  /** Pre-filled address to show (e.g. from stored profile) */
  initialValue?: string
  disabled?: boolean
  placeholder?: string
}

const DEBOUNCE_MS = 300

export default function AddressAutocomplete({
  onSelect,
  initialValue = '',
  disabled = false,
  placeholder = 'Start typing your street address…',
}: AddressAutocompleteProps) {
  const [input, setInput] = useState(initialValue)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [manualMode, setManualMode] = useState(false)
  const [proxyDown, setProxyDown] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const listboxId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) { setSuggestions([]); setOpen(false); return }
    try {
      const res = await fetch('/api/address-autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: query }),
      })
      if (!res.ok) {
        setSuggestions([])
        setOpen(false)
        setManualMode(true)
        setProxyDown(true)
        return
      }
      const data = await res.json()
      const texts: string[] = (data.suggestions ?? [])
        .map((s: Suggestion) => s.placePrediction?.text?.text ?? '')
        .filter(Boolean)
      setSuggestions(texts)
      setOpen(texts.length > 0)
      // Degrade to manual entry if API returns nothing
      if (texts.length === 0) setManualMode(true)
    } catch {
      setSuggestions([])
      setOpen(false)
      setManualMode(true)
      setProxyDown(true)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setInput(val)
    setActiveIndex(-1)
    setManualMode(false)
    setProxyDown(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), DEBOUNCE_MS)
  }

  function selectSuggestion(text: string) {
    setInput(text)
    setSuggestions([])
    setOpen(false)
    onSelect(text)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === 'Enter' && input.trim()) {
        e.preventDefault()
        onSelect(input.trim())
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        selectSuggestion(suggestions[activeIndex])
      } else if (input.trim()) {
        setOpen(false)
        onSelect(input.trim())
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const activeDescendant = activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={activeDescendant}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        style={{
          width: '100%',
          backgroundColor: 'var(--color-bg-input)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3) var(--space-4)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-body)',
          color: 'var(--color-text-primary)',
          boxSizing: 'border-box',
        }}
      />

      {/* Manual fallback: "Use this address" when no suggestions returned or proxy down */}
      {manualMode && input.trim().length >= 3 && (
        <div style={{ marginTop: 'var(--space-2)' }}>
          {proxyDown && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', lineHeight: 'var(--leading-relaxed)' }}>
              Address suggestions are unavailable right now — type your full address and press Enter.
            </p>
          )}
          <button
            type="button"
            onClick={() => onSelect(input.trim())}
            style={{
              background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-2) var(--space-4)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-small)',
              color: 'var(--color-blue-accent)',
              cursor: 'pointer',
            }}
          >
            Use this address
          </button>
        </div>
      )}

      {/* Suggestion dropdown */}
      {open && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 200,
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            listStyle: 'none',
            padding: 'var(--space-1)',
            margin: 0,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}
        >
          {suggestions.map((text, i) => (
            <li
              key={i}
              id={`${listboxId}-opt-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={() => selectSuggestion(text)}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-small)',
                color: 'var(--color-text-primary)',
                backgroundColor: i === activeIndex ? 'var(--color-bg-deep, #0f1f33)' : 'transparent',
              }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              {text}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
