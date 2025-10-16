import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon({ params }: { params?: { size?: string } }) {
    // Parse size from URL params or use default
    const iconSize = params?.size ? parseInt(params.size) : 32
    const fontSize = Math.max(iconSize * 0.4, 12)
    const borderRadius = Math.max(iconSize * 0.125, 2)

    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: fontSize,
                    background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
                    width: iconSize,
                    height: iconSize,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    borderRadius: borderRadius,
                }}
            >
                AI
            </div>
        ),
        {
            width: iconSize,
            height: iconSize,
        }
    )
}
