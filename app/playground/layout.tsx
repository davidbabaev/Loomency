import React from 'react'

export default function PlaygroundLayout({children}:{children: React.ReactNode;}) {
    return(
        <section style={{
            padding: 24,
            margin: 24,
            border: '1px dashed #555'
        }}>
            <p style={{marginBottom: 16, opacity: 0.7}}>
                Playground sub-layout (only under /playground/*)
            </p>
            {children}
        </section>
    )
}
