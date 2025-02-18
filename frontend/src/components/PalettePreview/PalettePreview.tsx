import React from 'react'
import './PalettePreview.module.css'

const PalettePreview = () => {
  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'var(--color-background)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {/* Base Colors */}
      <h2 style={{ color: 'var(--color-text)', marginBottom: '16px' }}>
        System 7-Inspired Palette
      </h2>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ color: 'var(--color-text)', marginBottom: '8px' }}>
          Base Colors
        </h3>
        <div style={{ display: 'flex', gap: '16px' }}>
          <ColorSwatch name="Base White" color="var(--color-base-white)" border />
          <ColorSwatch name="Base Black" color="var(--color-base-black)" />
          <ColorSwatch name="Base Gray" color="var(--color-base-gray)" />
        </div>
      </div>

      {/* Interface Colors */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ color: 'var(--color-text)', marginBottom: '8px' }}>
          Interface
        </h3>
        <div style={{ display: 'flex', gap: '16px' }}>
          <ColorSwatch name="Background" color="var(--color-background)" border />
          <ColorSwatch
            name="Background Alt"
            color="var(--color-background-alt)"
            border
          />
          <ColorSwatch
            name="Background Inset"
            color="var(--color-background-inset)"
          />
        </div>
      </div>

      {/* Interactive Demo */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ color: 'var(--color-text)', marginBottom: '16px' }}>
          Interactive Elements
        </h3>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--color-button)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: 'var(--color-text)',
            }}
          >
            Normal Button
          </button>

          <button
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--color-button-hover)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: 'var(--color-text)',
            }}
          >
            Hover State
          </button>

          <button
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--color-button-disabled)',
              border: '1px solid var(--color-border-light)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-muted)',
              cursor: 'not-allowed',
            }}
          >
            Disabled
          </button>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <a href="#" style={{ color: 'var(--color-link)' }}>
            Normal Link
          </a>
          <a href="#" style={{ color: 'var(--color-link-hover)' }}>
            Hover Link
          </a>
          <a href="#" style={{ color: 'var(--color-link-visited)' }}>
            Visited Link
          </a>
        </div>
      </div>

      {/* Status Colors */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ color: 'var(--color-text)', marginBottom: '8px' }}>
          Status Colors
        </h3>
        <div style={{ display: 'flex', gap: '16px' }}>
          <ColorSwatch name="Success" color="var(--color-success)" />
          <ColorSwatch name="Error" color="var(--color-error)" />
          <ColorSwatch name="Warning" color="var(--color-warning)" />
        </div>
      </div>

      {/* Pixel Editor Preview */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ color: 'var(--color-text)', marginBottom: '8px' }}>
          Pixel Editor Preview
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: '1px',
            padding: '8px',
            backgroundColor: 'var(--color-grid)',
            width: 'fit-content',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {Array(64)
            .fill(null)
            .map((_, i) => (
              <div
                key={i}
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor:
                    i % 3 === 0 ? 'var(--color-pixel-on)' : 'var(--color-pixel-off)',
                  border: '1px solid var(--color-grid)',
                }}
              />
            ))}
        </div>
      </div>

      {/* Pattern Preview */}
      <div>
        <h3 style={{ color: 'var(--color-text)', marginBottom: '8px' }}>
          Pattern Preview
        </h3>
        <div
          style={{
            height: '100px',
            backgroundImage: 'var(--pattern-stripe)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}
        />
      </div>
    </div>
  )
}

type TColorSwatchProps = {
  name: string
  color: string
  border?: boolean
}
const ColorSwatch: React.FC<TColorSwatchProps> = ({
  name,
  color,
  border = false,
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
    }}
  >
    <div
      style={{
        width: '60px',
        height: '60px',
        backgroundColor: color,
        borderRadius: 'var(--radius-sm)',
        border: border ? '1px solid var(--color-border)' : 'none',
      }}
    />
    <span
      style={{
        fontSize: '12px',
        color: 'var(--color-text-muted)',
        textAlign: 'center',
      }}
    >
      {name}
    </span>
  </div>
)

export default PalettePreview
