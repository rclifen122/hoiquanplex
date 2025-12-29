import React from 'react';

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-cinematic text-white">
            {children}
        </div>
    );
}
