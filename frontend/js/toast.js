// ==========================================
// TOAST + CONFIRM POPUP SYSTEM
// ==========================================
function showToast(message, type = 'success', duration = 3500) {
  document.querySelectorAll('.pau-toast').forEach(t => t.remove());
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  const colors = {
    success: { bg:'#d1fae5', border:'#059669', text:'#065f46' },
    error:   { bg:'#fee2e2', border:'#dc2626', text:'#991b1b' },
    warning: { bg:'#fff8ec', border:'#f5a623', text:'#7a5000' },
    info:    { bg:'#eef2ff', border:'#003087', text:'#003087' },
  };
  const c = colors[type] || colors.info;
  const toast = document.createElement('div');
  toast.className = 'pau-toast';
  toast.setAttribute('role', 'status');
  toast.style.cssText = `
    position:fixed; top:24px; right:24px; z-index:99999;
    background:${c.bg}; border:1.5px solid ${c.border}; color:${c.text};
    padding:14px 18px; border-radius:16px; font-family:'DM Sans',sans-serif;
    font-size:14px; font-weight:600; display:flex; align-items:flex-start; gap:10px;
    box-shadow:0 14px 40px rgba(0,0,0,0.18); max-width:360px; line-height:1.45;
    animation:toastIn 0.3s ease; backdrop-filter:blur(10px);
  `;
  toast.innerHTML = `
    <span style="font-size:20px;line-height:1;">${icons[type] || 'ℹ️'}</span>
    <span style="display:block;">${message}</span>
  `;
  if (!document.getElementById('toastStyle')) {
    const s = document.createElement('style');
    s.id = 'toastStyle';
    s.textContent = `
      @keyframes toastIn  { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
      @keyframes toastOut { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(40px)} }
    `;
    document.head.appendChild(s);
  }
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.animation='toastOut 0.3s ease forwards'; setTimeout(()=>toast.remove(),300); }, duration);
}

function showConfirm(message, subtext, onConfirm) {
  document.querySelectorAll('.pau-confirm').forEach(c => c.remove());
  const overlay = document.createElement('div');
  overlay.className = 'pau-confirm';
  overlay.style.cssText = `
    position:fixed; inset:0; z-index:99999;
    background:rgba(0,18,60,0.65); display:flex; align-items:center;
    justify-content:center; padding:20px; backdrop-filter:blur(4px);
  `;
  overlay.innerHTML = `
    <div style="background:white;border-radius:20px;padding:40px 36px;max-width:400px;
      width:100%;text-align:center;box-shadow:0 30px 80px rgba(0,0,0,0.3);
      font-family:'DM Sans',sans-serif; animation:toastIn 0.25s ease;">
      <div style="font-size:52px;margin-bottom:16px;">🗑️</div>
      <h3 style="font-family:'Playfair Display',serif;font-size:22px;color:#1a2340;margin-bottom:10px;">Are you sure?</h3>
      <p style="font-size:14px;color:#6b7280;margin-bottom:28px;line-height:1.6;">${subtext}</p>
      <div style="display:flex;gap:12px;justify-content:center;">
        <button id="pau-confirm-yes" style="background:#003087;color:white;border:none;padding:13px 32px;
          border-radius:9px;font-size:15px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;">
          Yes, Delete
        </button>
        <button id="pau-confirm-no" style="background:white;color:#6b7280;border:1.5px solid #d1d9e6;
          padding:13px 32px;border-radius:9px;font-size:15px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;">
          Cancel
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  overlay.querySelector('#pau-confirm-yes').onclick = () => { overlay.remove(); document.body.style.overflow=''; onConfirm(); };
  overlay.querySelector('#pau-confirm-no').onclick  = () => { overlay.remove(); document.body.style.overflow=''; };
  overlay.onclick = e => { if(e.target===overlay){ overlay.remove(); document.body.style.overflow=''; }};
}