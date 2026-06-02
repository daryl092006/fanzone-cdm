'use client';

import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeClientProps {
    value: string;
    size?: number;
}

export default function QRCodeClient({ value, size = 160 }: QRCodeClientProps) {
    return (
        <QRCodeCanvas
            value={value}
            size={size}
            level="H"
            includeMargin={true}
        />
    );
}
