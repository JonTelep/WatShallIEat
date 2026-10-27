import { ImageResponse } from 'next/og';

export const config = { runtime: 'edge' };

export default function handler(req) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get('title') || 'Wat Shall I Eat').slice(0, 90);
  const subtitle = (searchParams.get('subtitle') || 'Nearby meals and weekly ideas you can cook').slice(0, 160);
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#111827',
          color: '#f9fafb',
          padding: '64px',
        }}
      >
        <div style={{ fontSize: 28, color: '#93c5fd' }}>WAT SHALL I EAT</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.15 }}>{title}</div>
          <div style={{ fontSize: 30, marginTop: 24, color: '#d1d5db' }}>{subtitle}</div>
        </div>
        <div style={{ fontSize: 24 }}>watshallieat.com</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
