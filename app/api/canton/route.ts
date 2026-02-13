import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== Canton API Route Started ===');
    
    // Step 1: Get current round info and amulet price
    console.log('Fetching round info...');
    const roundResponse = await fetch(
      'https://scan.canton.global.digitalasset.com/api/scan/v0/open-and-issuing-mining-rounds',
      { 
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      }
    );
    
    if (!roundResponse.ok) {
      console.error('Round fetch failed:', roundResponse.status, roundResponse.statusText);
      throw new Error(`Failed to fetch rounds: ${roundResponse.status}`);
    }
    
    const roundData = await roundResponse.json();
    console.log('Round data received:', JSON.stringify(roundData).slice(0, 200));
    
    const currentRound = roundData.open_mining_rounds?.[0]?.payload?.round?.number;
    const amuletPrice = roundData.open_mining_rounds?.[0]?.payload?.amulet_price;
    
    if (!currentRound) {
      throw new Error('Could not find current round number in response');
    }
    
    console.log(`Current round: ${currentRound}, Amulet price: ${amuletPrice}`);
    
    // Step 2: Get recent transactions
    console.log('Fetching transactions...');
    const txResponse = await fetch(
      'https://scan.canton.global.digitalasset.com/api/scan/v2/updates?count=100',
      { 
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      }
    );
    
    if (!txResponse.ok) {
      console.error('TX fetch failed:', txResponse.status, txResponse.statusText);
      throw new Error(`Failed to fetch transactions: ${txResponse.status}`);
    }
    
    const txData = await txResponse.json();
    console.log(`Received ${txData.updates?.length || 0} updates`);
    
    // Parse transactions and group by party
    const partyMap = new Map();
    
    txData.updates?.forEach((update: any) => {
      const tree = update.update?.transaction_tree;
      if (!tree) return;
      
      // Extract burns from events_by_id
      Object.entries(tree.events_by_id || {}).forEach(([eventId, event]: [string, any]) => {
        const created = event.created;
        if (!created) return;
        
        // Look for burn events
        const templateId = created.template_id?.entity_name;
        if (templateId?.includes('Burn') || templateId?.includes('Fee')) {
          const partyId = tree.roots?.[0] || 'unknown';
          
          if (!partyMap.has(partyId)) {
            partyMap.set(partyId, {
              partyId,
              totalBurnCC: 0,
              totalBurnUSD: 0,
              burnEvents: 0,
              transactions: []
            });
          }
          
          const party = partyMap.get(partyId);
          const burnCC = 1.0; // Placeholder
          const burnUSD = burnCC * (amuletPrice || 1.0);
          
          party.totalBurnCC += burnCC;
          party.totalBurnUSD += burnUSD;
          party.burnEvents += 1;
          
          party.transactions.push({
            id: eventId,
            type: templateId || 'Unknown',
            burnCC,
            burnUSD,
            timestamp: new Date(update.record_time).toLocaleString(),
            holdingFeeCC: burnCC * 0.25,
            trafficFeeCC: burnCC * 0.25,
            transferFeeCC: burnCC * 0.25,
            outputFeeCC: burnCC * 0.25,
          });
        }
      });
    });
    
    const parties = Array.from(partyMap.values());
    console.log(`Processed ${parties.length} parties with burn activity`);
    
    const totalBurnCC = parties.reduce((sum, p) => sum + p.totalBurnCC, 0);
    const totalBurnUSD = parties.reduce((sum, p) => sum + p.totalBurnUSD, 0);
    const totalEvents = parties.reduce((sum, p) => sum + p.burnEvents, 0);
    
    const result = {
      round: {
        round: currentRound,
        timestamp: new Date().toLocaleString(),
        totalBurnCC,
        totalBurnUSD,
        burnEvents: totalEvents,
        parties
      }
    };
    
    console.log('=== Canton API Route Success ===');
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('=== Canton API Route Error ===');
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}