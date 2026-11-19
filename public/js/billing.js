// OWNER: Member 3
// Billing ledger table and CSV export.

function renderLedger() {
  document.getElementById('ledger-tbody').innerHTML = state.ledger.map(row => {
    const v = state.vendors.find(vend => vend.id === row.vendorId);
    const comm = Math.round(row.gross * 0.1);
    const net = row.gross - comm;
    return `
      <tr>
        <td class="py-2.5 px-3 font-mono font-semibold text-slate-700">${row.id}</td>
        <td class="py-2.5 px-3 font-semibold text-slate-900">${v ? v.shop : row.vendorId}</td>
        <td class="py-2.5 px-3 text-slate-700">${row.desc}</td>
        <td class="py-2.5 px-3 font-semibold">৳${row.gross.toLocaleString()}</td>
        <td class="py-2.5 px-3 text-rose-600">৳${comm.toLocaleString()}</td>
        <td class="py-2.5 px-3 font-bold text-emerald-700">৳${net.toLocaleString()}</td>
      </tr>
    `;
  }).join('');
}

function exportCSV() {
  const headers = ['Txn ID,Vendor ID,Shop Name,Description,Gross (BDT),Commission 10% (BDT),Net Payout (BDT)'];
  const rows = state.ledger.map(r => {
    const v = state.vendors.find(vend => vend.id === r.vendorId);
    const comm = Math.round(r.gross * 0.1);
    const net = r.gross - comm;
    return `"${r.id}","${r.vendorId}","${v ? v.shop : ''}","${r.desc}",${r.gross},${comm},${net}`;
  });
  const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'SMVMS_Billing_Report.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('CSV report downloaded');
}
