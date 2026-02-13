'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type View = 'main' | 'round-parties' | 'round-transactions' | 'round-detail' | 'day-parties' | 'day-transactions' | 'day-detail';

interface Transaction {
  id: string;
  type: string;
  burnCC: number;
  burnUSD: number;
  timestamp: string;
  holdingFeeCC: number;
  trafficFeeCC: number;
  transferFeeCC: number;
  outputFeeCC: number;
}

interface Party {
  partyId: string;
  totalBurnCC: number;
  totalBurnUSD: number;
  burnEvents: number;
  transactions: Transaction[];
}

interface Round {
  round: number;
  timestamp: string;
  totalBurnCC: number;
  totalBurnUSD: number;
  burnEvents: number;
  parties: Party[];
}

interface Day {
  date: string;
  totalBurnCC: number;
  totalBurnUSD: number;
  burnEvents: number;
  parties: Party[];
}

export default function Home() {
  const [view, setView] = useState<View>('main');
  const [selectedRound, setSelectedRound] = useState<Round | null>(null);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [drillContext, setDrillContext] = useState<'round' | 'day'>('round');
  const [liveRound, setLiveRound] = useState<Round | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real Canton data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch('/api/canton');
        if (!res.ok) throw new Error('Failed to fetch Canton data');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        
        setLiveRound(data.round);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const cardStyle = (color: string) => ({
    background: color,
    borderRadius: '12px',
    padding: '20px',
    flex: 1,
  } as React.CSSProperties);

  const th = { padding: '12px', fontSize: '13px', color: '#555' };
  const td = { padding: '12px', fontSize: '14px' };
  const clickableTd = { ...td, color: '#0070f3', cursor: 'pointer', textDecoration: 'underline' };
  const tableHeaderStyle = { background: '#f4f4f4', textAlign: 'left' as const };

  const backButton = (label: string, onClick: () => void) => (
    <button onClick={onClick} style={{ marginBottom: '24px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: '14px' }}>
      ← Back to {label}
    </button>
  );

  const feeBreakdownChart = (tx: Transaction) => (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={[
        { name: 'Holding', CC: tx.holdingFeeCC },
        { name: 'Traffic', CC: tx.trafficFeeCC },
        { name: 'Transfer', CC: tx.transferFeeCC },
        { name: 'Output', CC: tx.outputFeeCC },
      ]}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => value ? `${Number(value).toFixed(2)} CC` : '0 CC'} />
        <Bar dataKey="CC" fill="#f59e0b" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  // Loading state
  if (loading) {
    return (
      <main style={{ fontFamily: 'sans-serif', padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Canton Network Fee Burn Explorer</h1>
        <p style={{ color: '#888', marginBottom: '40px' }}>Loading live data from Canton Network...</p>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ color: '#666' }}>Fetching real-time burn data...</div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main style={{ fontFamily: 'sans-serif', padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Canton Network Fee Burn Explorer</h1>
        <p style={{ color: '#888', marginBottom: '40px' }}>Unable to load data</p>
        <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#c53030', marginBottom: '8px' }}>Error Loading Data</div>
          <div style={{ color: '#742a2a' }}>{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '16px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#3182ce', color: 'white', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  // Use live data if available
  const roundData = liveRound ? [liveRound] : [];
  const dailyData: Day[] = [];

  // PARTY VIEW (shared by round and day drill-down)
  if ((view === 'round-parties' && selectedRound) || (view === 'day-parties' && selectedDay)) {
    const isRound = view === 'round-parties';
    const source = isRound ? selectedRound! : selectedDay!;
    const label = isRound ? `Round ${(source as Round).round}` : (source as Day).date;
    const backLabel = isRound ? 'Rounds' : 'Days';
    const backView = isRound ? 'main' : 'main';
    const chartData = source.parties.slice(0, 10).map(p => ({ name: p.partyId.slice(-8), USD: p.totalBurnUSD }));

    return (
      <main style={{ fontFamily: 'sans-serif', padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>
        {backButton(backLabel, () => setView(backView as View))}
        <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>{label} — Parties</h1>
        <p style={{ color: '#888', marginBottom: '32px' }}>Click any party to see their transactions</p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
          <div style={cardStyle('#f0f7ff')}>
            <div style={{ fontSize: '13px', color: '#888' }}>Total Burn (USD)</div>
            <div style={{ fontSize: '26px', fontWeight: 'bold' }}>${source.totalBurnUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div style={cardStyle('#f0fff4')}>
            <div style={{ fontSize: '13px', color: '#888' }}>Total Burn (CC)</div>
            <div style={{ fontSize: '26px', fontWeight: 'bold' }}>{source.totalBurnCC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CC</div>
          </div>
          <div style={cardStyle('#fff7f0')}>
            <div style={{ fontSize: '13px', color: '#888' }}>Burn Events</div>
            <div style={{ fontSize: '26px', fontWeight: 'bold' }}>{source.burnEvents.toLocaleString()}</div>
          </div>
          <div style={cardStyle('#fdf0ff')}>
            <div style={{ fontSize: '13px', color: '#888' }}>Active Parties</div>
            <div style={{ fontSize: '26px', fontWeight: 'bold' }}>{source.parties.length}</div>
          </div>
        </div>

        {source.parties.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '16px', marginBottom: '16px', color: '#444' }}>Top Parties by Burn (USD)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => value ? `$${Number(value).toLocaleString()}` : '$0'} />
                <Bar dataKey="USD" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={tableHeaderStyle}>
              <th style={th}>Party ID</th>
              <th style={th}>Total Burn (USD)</th>
              <th style={th}>Total Burn (CC)</th>
              <th style={th}>Burn Events</th>
              <th style={th}>% of Total</th>
            </tr>
          </thead>
          <tbody>
            {source.parties.map((p) => (
              <tr key={p.partyId} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ ...clickableTd, fontFamily: 'monospace', fontSize: '12px' }} onClick={() => {
                  setSelectedParty(p);
                  setDrillContext(isRound ? 'round' : 'day');
                  setView(isRound ? 'round-transactions' : 'day-transactions');
                }}>{p.partyId}</td>
                <td style={td}>${p.totalBurnUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td style={td}>{p.totalBurnCC.toLocaleString(undefined, { minimumFractionDigits: 2 })} CC</td>
                <td style={td}>{p.burnEvents.toLocaleString()}</td>
                <td style={td}>{((p.totalBurnUSD / source.totalBurnUSD) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    );
  }// TRANSACTION LIST VIEW
  if ((view === 'round-transactions' || view === 'day-transactions') && selectedParty) {
    const isRound = drillContext === 'round';
    const parentLabel = isRound ? `Round ${selectedRound?.round}` : selectedDay?.date;
    const backView = isRound ? 'round-parties' : 'day-parties';
    const chartData = selectedParty.transactions.slice(0, 10).map(t => ({ name: t.id, USD: t.burnUSD }));

    return (
      <main style={{ fontFamily: 'sans-serif', padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>
        {backButton('Parties', () => setView(backView as View))}
        <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>{parentLabel} — Transactions</h1>
        <p style={{ color: '#888', marginBottom: '8px' }}>Party: <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>{selectedParty.partyId}</span></p>
        <p style={{ color: '#888', marginBottom: '32px' }}>Click any transaction to see full details</p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
          <div style={cardStyle('#f0f7ff')}>
            <div style={{ fontSize: '13px', color: '#888' }}>Party Total (USD)</div>
            <div style={{ fontSize: '26px', fontWeight: 'bold' }}>${selectedParty.totalBurnUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div style={cardStyle('#f0fff4')}>
            <div style={{ fontSize: '13px', color: '#888' }}>Party Total (CC)</div>
            <div style={{ fontSize: '26px', fontWeight: 'bold' }}>{selectedParty.totalBurnCC.toLocaleString(undefined, { minimumFractionDigits: 2 })} CC</div>
          </div>
          <div style={cardStyle('#fff7f0')}>
            <div style={{ fontSize: '13px', color: '#888' }}>Burn Events</div>
            <div style={{ fontSize: '26px', fontWeight: 'bold' }}>{selectedParty.burnEvents.toLocaleString()}</div>
          </div>
        </div>

        {selectedParty.transactions.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '16px', marginBottom: '16px', color: '#444' }}>Burn by Transaction (USD)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => value ? `$${Number(value).toLocaleString()}` : '$0'} />
                <Bar dataKey="USD" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={tableHeaderStyle}>
              <th style={th}>Transaction ID</th>
              <th style={th}>Type</th>
              <th style={th}>Burn (USD)</th>
              <th style={th}>Burn (CC)</th>
              <th style={th}>Time</th>
            </tr>
          </thead>
          <tbody>
            {selectedParty.transactions.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ ...clickableTd, fontFamily: 'monospace', fontSize: '12px' }} onClick={() => {
                  setSelectedTx(t);
                  setView(isRound ? 'round-detail' : 'day-detail');
                }}>{t.id}</td>
                <td style={td}>{t.type}</td>
                <td style={td}>${t.burnUSD.toFixed(2)}</td>
                <td style={td}>{t.burnCC.toFixed(2)} CC</td>
                <td style={td}>{t.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    );
  }

  // TRANSACTION DETAIL VIEW
  if ((view === 'round-detail' || view === 'day-detail') && selectedTx && selectedParty) {
    const isRound = drillContext === 'round';
    const backView = isRound ? 'round-transactions' : 'day-transactions';

    return (
      <main style={{ fontFamily: 'sans-serif', padding: '40px', maxWidth: '700px', margin: '0 auto' }}>
        {backButton('Transactions', () => setView(backView as View))}
        <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Transaction Detail</h1>
        <p style={{ color: '#888', marginBottom: '32px' }}>Full breakdown of all publicly available fee data</p>

        <div style={{ background: '#f9f9f9', borderRadius: '12px', padding: '28px', marginBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[
              ['Transaction ID', selectedTx.id],
              ['Type', selectedTx.type],
              ['Context', isRound ? `Round ${selectedRound?.round}` : selectedDay?.date],
              ['Timestamp', selectedTx.timestamp],
              ['Party ID', selectedParty.partyId],
              ['Total Burn (USD)', `$${selectedTx.burnUSD.toFixed(2)}`],
              ['Total Burn (CC)', `${selectedTx.burnCC.toFixed(2)} CC`],
            ].map(([label, value]) => (
              <div key={label as string}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '15px', fontWeight: '500', fontFamily: label === 'Transaction ID' || label === 'Party ID' ? 'monospace' : 'sans-serif' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        <h2 style={{ fontSize: '16px', marginBottom: '16px', color: '#444' }}>Fee Breakdown</h2>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <div style={cardStyle('#f0f7ff')}>
            <div style={{ fontSize: '12px', color: '#888' }}>Holding Fee</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedTx.holdingFeeCC.toFixed(2)} CC</div>
          </div>
          <div style={cardStyle('#f0fff4')}>
            <div style={{ fontSize: '12px', color: '#888' }}>Traffic Fee</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedTx.trafficFeeCC.toFixed(2)} CC</div>
          </div>
          <div style={cardStyle('#fff7f0')}>
            <div style={{ fontSize: '12px', color: '#888' }}>Transfer Fee</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedTx.transferFeeCC.toFixed(2)} CC</div>
          </div>
          <div style={cardStyle('#fdf0ff')}>
            <div style={{ fontSize: '12px', color: '#888' }}>Output Fee</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedTx.outputFeeCC.toFixed(2)} CC</div>
          </div>
        </div>

        <h2 style={{ fontSize: '16px', marginBottom: '16px', color: '#444' }}>Fee Breakdown Chart</h2>
        {feeBreakdownChart(selectedTx)}
      </main>
    );
  }

  // MAIN VIEW - Live Canton Data
  const roundChartData = roundData.map(r => ({ name: `R${r.round}`, USD: r.totalBurnUSD }));
  const totalRoundUSD = roundData.reduce((s, r) => s + r.totalBurnUSD, 0);
  const totalRoundCC = roundData.reduce((s, r) => s + r.totalBurnCC, 0);
  const totalRoundEvents = roundData.reduce((s, r) => s + r.burnEvents, 0);

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Canton Network Fee Burn Explorer</h1>
      <p style={{ color: '#888', marginBottom: '8px' }}>Live data from Canton Network MainNet</p>
      <p style={{ color: '#10b981', fontSize: '13px', marginBottom: '40px' }}>● Connected to real-time network data</p>

      {/* LIVE ROUND SECTION */}
      <h2 style={{ fontSize: '20px', marginBottom: '16px', borderBottom: '2px solid #eee', paddingBottom: '8px' }}>Latest Round Activity</h2>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <div style={cardStyle('#f0f7ff')}>
          <div style={{ fontSize: '13px', color: '#888' }}>Total Burned (USD)</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>${totalRoundUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div style={cardStyle('#f0fff4')}>
          <div style={{ fontSize: '13px', color: '#888' }}>Total Burned (CC)</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalRoundCC.toLocaleString(undefined, { minimumFractionDigits: 2 })} CC</div>
        </div>
        <div style={cardStyle('#fff7f0')}>
          <div style={{ fontSize: '13px', color: '#888' }}>Burn Events</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalRoundEvents.toLocaleString()}</div>
        </div>
        <div style={cardStyle('#fdf0ff')}>
          <div style={{ fontSize: '13px', color: '#888' }}>Active Parties</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{liveRound?.parties.length ?? 0}</div>
        </div>
      </div>

      {roundData.length > 0 && roundData[0].parties.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '15px', marginBottom: '12px', color: '#444' }}>Recent Burn Activity (USD)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={roundChartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => value ? `$${Number(value).toLocaleString()}` : '$0'} />
              <Bar dataKey="USD" fill="#0070f3" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '60px' }}>
        <thead>
          <tr style={tableHeaderStyle}>
            <th style={th}>Round</th>
            <th style={th}>Timestamp</th>
            <th style={th}>Total Burn (USD)</th>
            <th style={th}>Total Burn (CC)</th>
            <th style={th}>Burn Events</th>
            <th style={th}>Parties</th>
          </tr>
        </thead>
        <tbody>
          {roundData.map((r) => (
            <tr key={r.round} style={{ borderBottom: '1px solid #eee' }}>
              <td style={clickableTd} onClick={() => { setSelectedRound(r); setView('round-parties'); }}>{r.round}</td>
              <td style={td}>{r.timestamp}</td>
              <td style={td}>${r.totalBurnUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style={td}>{r.totalBurnCC.toLocaleString(undefined, { minimumFractionDigits: 2 })} CC</td>
              <td style={td}>{r.burnEvents.toLocaleString()}</td>
              <td style={td}>{r.parties.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}