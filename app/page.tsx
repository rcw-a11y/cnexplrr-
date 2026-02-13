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

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockRound: Round = {
        round: 1847392,
        timestamp: new Date().toLocaleString(),
        totalBurnCC: 5247.89,
        totalBurnUSD: 864.52,
        burnEvents: 143,
        parties: [
          {
            partyId: 'Openvector-V1::122033c0ef8b9d4a7c6f5e2d',
            totalBurnCC: 1533585.30,
            totalBurnUSD: 252561,
            burnEvents: 48,
            transactions: [
              { id: 'tx_openvector_001', type: 'TrafficPurchase', burnCC: 45234.12, burnUSD: 7450.12, timestamp: new Date(Date.now() - 120000).toLocaleString(), holdingFeeCC: 11308.53, trafficFeeCC: 22617.06, transferFeeCC: 7539.02, outputFeeCC: 3769.51 },
              { id: 'tx_openvector_002', type: 'HoldingFee', burnCC: 32145.67, burnUSD: 5294.73, timestamp: new Date(Date.now() - 240000).toLocaleString(), holdingFeeCC: 8036.42, trafficFeeCC: 16072.84, transferFeeCC: 5357.61, outputFeeCC: 2678.81 },
              { id: 'tx_openvector_003', type: 'TransferFee', burnCC: 28934.55, burnUSD: 4765.89, timestamp: new Date(Date.now() - 360000).toLocaleString(), holdingFeeCC: 7233.64, trafficFeeCC: 14467.28, transferFeeCC: 4822.43, outputFeeCC: 2411.21 },
            ]
          },
          {
            partyId: 'JPM-Native-Deposit::a7b8c9d0e1f2a3b4c5d6',
            totalBurnCC: 1324330.15,
            totalBurnUSD: 218100,
            burnEvents: 42,
            transactions: [
              { id: 'tx_jpm_001', type: 'OutputFee', burnCC: 38234.89, burnUSD: 6298.75, timestamp: new Date(Date.now() - 180000).toLocaleString(), holdingFeeCC: 9558.72, trafficFeeCC: 19117.45, transferFeeCC: 6372.48, outputFeeCC: 3186.24 },
              { id: 'tx_jpm_002', type: 'CNSEntryFee', burnCC: 31245.12, burnUSD: 5145.24, timestamp: new Date(Date.now() - 300000).toLocaleString(), holdingFeeCC: 7811.28, trafficFeeCC: 15622.56, transferFeeCC: 5207.52, outputFeeCC: 2603.76 },
              { id: 'tx_jpm_003', type: 'TrafficPurchase', burnCC: 27893.44, burnUSD: 4594.17, timestamp: new Date(Date.now() - 420000).toLocaleString(), holdingFeeCC: 6973.36, trafficFeeCC: 13946.72, transferFeeCC: 4648.91, outputFeeCC: 2324.45 },
            ]
          },
          {
            partyId: 'Goldman-DAX-Settlement::d1e2f3a4b5c6d7e8',
            totalBurnCC: 965471.20,
            totalBurnUSD: 159000,
            burnEvents: 35,
            transactions: [
              { id: 'tx_gs_001', type: 'TransferFee', burnCC: 27567.82, burnUSD: 4538.87, timestamp: new Date(Date.now() - 480000).toLocaleString(), holdingFeeCC: 6891.96, trafficFeeCC: 13783.91, transferFeeCC: 4594.64, outputFeeCC: 2297.32 },
              { id: 'tx_gs_002', type: 'HoldingFee', burnCC: 24123.45, burnUSD: 3972.35, timestamp: new Date(Date.now() - 540000).toLocaleString(), holdingFeeCC: 6030.86, trafficFeeCC: 12061.73, transferFeeCC: 4020.58, outputFeeCC: 2010.29 },
            ]
          },
          {
            partyId: 'Broadridge-Repoway::e2f3a4b5c6d7e8f9',
            totalBurnCC: 844025.35,
            totalBurnUSD: 139000,
            burnEvents: 31,
            transactions: [
              { id: 'tx_broadridge_001', type: 'OutputFee', burnCC: 23456.78, burnUSD: 3863.27, timestamp: new Date(Date.now() - 600000).toLocaleString(), holdingFeeCC: 5864.20, trafficFeeCC: 11728.39, transferFeeCC: 3909.46, outputFeeCC: 1954.73 },
              { id: 'tx_broadridge_002', type: 'TrafficPurchase', burnCC: 21234.56, burnUSD: 3497.29, timestamp: new Date(Date.now() - 660000).toLocaleString(), holdingFeeCC: 5308.64, trafficFeeCC: 10617.28, transferFeeCC: 3539.09, outputFeeCC: 1769.55 },
            ]
          },
          {
            partyId: 'DTCC-Settlement::f3a4b5c6d7e8f9a0',
            totalBurnCC: 723145.67,
            totalBurnUSD: 119118,
            burnEvents: 28,
            transactions: [
              { id: 'tx_dtcc_001', type: 'HoldingFee', burnCC: 20345.89, burnUSD: 3351.01, timestamp: new Date(Date.now() - 720000).toLocaleString(), holdingFeeCC: 5086.47, trafficFeeCC: 10172.95, transferFeeCC: 3390.98, outputFeeCC: 1695.49 },
            ]
          },
          {
            partyId: 'BNP-Paribas-Tokenization::a4b5c6d7e8f9a0b1',
            totalBurnCC: 657238.92,
            totalBurnUSD: 108268,
            burnEvents: 24,
            transactions: [
              { id: 'tx_bnp_001', type: 'TransferFee', burnCC: 18234.12, burnUSD: 3003.62, timestamp: new Date(Date.now() - 780000).toLocaleString(), holdingFeeCC: 4558.53, trafficFeeCC: 9117.06, transferFeeCC: 3039.02, outputFeeCC: 1519.51 },
            ]
          },
        ]
      };
      
      setLiveRound(mockRound);
      setLoading(false);
    }
    loadData();
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
        <Tooltip formatter={(value) => value !== undefined ? `${Number(value).toLocaleString()} CC` : '0 CC'} />
        <Bar dataKey="CC" fill="#f59e0b" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  if (loading) {
    return (
      <main style={{ fontFamily: 'sans-serif', padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Canton Network Fee Burn Explorer</h1>
        <p style={{ color: '#888', marginBottom: '40px' }}>Loading demo data...</p>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ color: '#666' }}>Preparing realistic Canton Network burn data...</div>
        </div>
      </main>
    );
  }

  const roundData = liveRound ? [liveRound] : [];
  const dailyData: Day[] = [];

  if ((view === 'round-parties' && selectedRound) || (view === 'day-parties' && selectedDay)) {
    const isRound = view === 'round-parties';
    const source = isRound ? selectedRound! : selectedDay!;
    const label = isRound ? `Round ${(source as Round).round}` : (source as Day).date;
    const backLabel = isRound ? 'Rounds' : 'Days';
    const backView = isRound ? 'main' : 'main';
    const chartData = source.parties.slice(0, 10).map(p => ({ name: p.partyId.split('::')[0], USD: p.totalBurnUSD }));

    return (
      <main style={{ fontFamily: 'sans-serif', padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>
        {backButton(backLabel, () => setView(backView as View))}
        <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>{label} — Fee Generators</h1>
        <p style={{ color: '#888', marginBottom: '32px' }}>Click any party to see their transactions</p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
          <div style={cardStyle('#f0f7ff')}>
            <div style={{ fontSize: '13px', color: '#888' }}>Total Burn (USD)</div>
            <div style={{ fontSize: '26px', fontWeight: 'bold' }}>${source.totalBurnUSD.toLocaleString()}</div>
          </div>
          <div style={cardStyle('#f0fff4')}>
            <div style={{ fontSize: '13px', color: '#888' }}>Total Burn (CC)</div>
            <div style={{ fontSize: '26px', fontWeight: 'bold' }}>{source.totalBurnCC.toLocaleString()} CC</div>
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
            <h2 style={{ fontSize: '16px', marginBottom: '16px', color: '#444' }}>Top Fee Generators by Burn (USD)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => value !== undefined ? `$${Number(value).toLocaleString()}` : '$0'} />
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
                <td style={{ ...clickableTd, fontFamily: 'monospace', fontSize: '13px' }} onClick={() => {
                  setSelectedParty(p);
                  setDrillContext(isRound ? 'round' : 'day');
                  setView(isRound ? 'round-transactions' : 'day-transactions');
                }}>{p.partyId}</td>
                <td style={td}>${p.totalBurnUSD.toLocaleString()}</td>
                <td style={td}>{p.totalBurnCC.toLocaleString()} CC</td>
                <td style={td}>{p.burnEvents.toLocaleString()}</td>
                <td style={td}>{((p.totalBurnUSD / source.totalBurnUSD) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    );
  }

  if ((view === 'round-transactions' || view === 'day-transactions') && selectedParty) {
    const isRound = drillContext === 'round';
    const parentLabel = isRound ? `Round ${selectedRound?.round}` : selectedDay?.date;
    const backView = isRound ? 'round-parties' : 'day-parties';
    const chartData = selectedParty.transactions.slice(0, 10).map((t, i) => ({ name: `TX ${i+1}`, USD: t.burnUSD }));

    return (
      <main style={{ fontFamily: 'sans-serif', padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>
        {backButton('Parties', () => setView(backView as View))}
        <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>{parentLabel} — Transactions</h1>
        <p style={{ color: '#888', marginBottom: '8px' }}>Party: <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>{selectedParty.partyId}</span></p>
        <p style={{ color: '#888', marginBottom: '32px' }}>Click any transaction to see full details</p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
          <div style={cardStyle('#f0f7ff')}>
            <div style={{ fontSize: '13px', color: '#888' }}>Party Total (USD)</div>
            <div style={{ fontSize: '26px', fontWeight: 'bold' }}>${selectedParty.totalBurnUSD.toLocaleString()}</div>
          </div>
          <div style={cardStyle('#f0fff4')}>
            <div style={{ fontSize: '13px', color: '#888' }}>Party Total (CC)</div>
            <div style={{ fontSize: '26px', fontWeight: 'bold' }}>{selectedParty.totalBurnCC.toLocaleString()} CC</div>
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
                <Tooltip formatter={(value) => value !== undefined ? `$${Number(value).toLocaleString()}` : '$0'} />
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
                <td style={td}>${t.burnUSD.toLocaleString()}</td>
                <td style={td}>{t.burnCC.toLocaleString()} CC</td>
                <td style={td}>{t.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    );
  }

  if ((view === 'round-detail' || view === 'day-detail') && selectedTx && selectedParty) {
    const isRound = drillContext === 'round';
    const backView = isRound ? 'round-transactions' : 'day-transactions';

    return (
      <main style={{ fontFamily: 'sans-serif', padding: '40px', maxWidth: '700px', margin: '0 auto' }}>
        {backButton('Transactions', () => setView(backView as View))}
        <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Transaction Detail</h1>
        <p style={{ color: '#888', marginBottom: '32px' }}>Full breakdown of fee burn data</p>

        <div style={{ background: '#f9f9f9', borderRadius: '12px', padding: '28px', marginBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[
              ['Transaction ID', selectedTx.id],
              ['Type', selectedTx.type],
              ['Context', isRound ? `Round ${selectedRound?.round}` : selectedDay?.date],
              ['Timestamp', selectedTx.timestamp],
              ['Party ID', selectedParty.partyId.split('::')[0]],
              ['Total Burn (USD)', `$${selectedTx.burnUSD.toLocaleString()}`],
              ['Total Burn (CC)', `${selectedTx.burnCC.toLocaleString()} CC`],
            ].map(([label, value]) => (
              <div key={label as string}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '15px', fontWeight: '500', fontFamily: label === 'Transaction ID' || label === 'Party ID' ? 'monospace' : 'sans-serif', wordBreak: 'break-all' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        <h2 style={{ fontSize: '16px', marginBottom: '16px', color: '#444' }}>Fee Breakdown</h2>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <div style={{ ...cardStyle('#f0f7ff'), minWidth: '180px' }}>
            <div style={{ fontSize: '12px', color: '#888' }}>Holding Fee</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedTx.holdingFeeCC.toLocaleString()} CC</div>
          </div>
          <div style={{ ...cardStyle('#f0fff4'), minWidth: '180px' }}>
            <div style={{ fontSize: '12px', color: '#888' }}>Traffic Fee</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedTx.trafficFeeCC.toLocaleString()} CC</div>
          </div>
          <div style={{ ...cardStyle('#fff7f0'), minWidth: '180px' }}>
            <div style={{ fontSize: '12px', color: '#888' }}>Transfer Fee</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedTx.transferFeeCC.toLocaleString()} CC</div>
          </div>
          <div style={{ ...cardStyle('#fdf0ff'), minWidth: '180px' }}>
            <div style={{ fontSize: '12px', color: '#888' }}>Output Fee</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedTx.outputFeeCC.toLocaleString()} CC</div>
          </div>
        </div>

        <h2 style={{ fontSize: '16px', marginBottom: '16px', color: '#444' }}>Fee Breakdown Chart</h2>
        {feeBreakdownChart(selectedTx)}
      </main>
    );
  }

  const roundChartData = roundData.map(r => ({ name: `Round ${r.round}`, USD: r.totalBurnUSD }));
  const totalRoundUSD = roundData.reduce((s, r) => s + r.totalBurnUSD, 0);
  const totalRoundCC = roundData.reduce((s, r) => s + r.totalBurnCC, 0);
  const totalRoundEvents = roundData.reduce((s, r) => s + r.burnEvents, 0);

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Canton Network Fee Burn Explorer</h1>
      <p style={{ color: '#888', marginBottom: '8px' }}>Demo data showing realistic Canton Network burn metrics</p>
      <p style={{ color: '#f59e0b', fontSize: '13px', marginBottom: '40px' }}>⚠️ Using demo data - Real-time API integration in progress</p>

      <h2 style={{ fontSize: '20px', marginBottom: '16px', borderBottom: '2px solid #eee', paddingBottom: '8px' }}>Latest Round Activity</h2>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div style={cardStyle('#f0f7ff')}>
          <div style={{ fontSize: '13px', color: '#888' }}>Total Burned (USD)</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>${totalRoundUSD.toLocaleString()}</div>
        </div>
        <div style={cardStyle('#f0fff4')}>
          <div style={{ fontSize: '13px', color: '#888' }}>Total Burned (CC)</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalRoundCC.toLocaleString()} CC</div>
        </div>
        <div style={cardStyle('#fff7f0')}>
          <div style={{ fontSize: '13px', color: '#888' }}>Burn Events</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalRoundEvents.toLocaleString()}</div>
        </div>
        <div style={cardStyle('#fdf0ff')}>
          <div style={{ fontSize: '13px', color: '#888' }}>Fee Generators</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{liveRound?.parties.length ?? 0}</div>
        </div>
      </div>

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
              <td style={td}>${r.totalBurnUSD.toLocaleString()}</td>
              <td style={td}>{r.totalBurnCC.toLocaleString()} CC</td>
              <td style={td}>{r.burnEvents.toLocaleString()}</td>
              <td style={td}>{r.parties.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}