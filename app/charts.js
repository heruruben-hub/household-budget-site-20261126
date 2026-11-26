// RumahAnggaran — small canvas charts, drawn with the 2D context only.
// No chart library: every chart is a few dozen lines of plain canvas code,
// sized to its element and redrawn whenever the underlying figures change.

export function fitCanvas(canvas) {
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height) return null;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, width, height };
}

function legendDot(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
}

// Donut: share of spending by category. slices: [{label, value, color}].
export function drawDonut(canvas, slices) {
  const fitted = fitCanvas(canvas);
  if (!fitted) return;
  const { ctx, width, height } = fitted;
  const total = slices.reduce((s, item) => s + item.value, 0);
  const cx = 92;
  const cy = height / 2;
  const radius = Math.min(78, height / 2 - 8);
  const inner = radius * 0.62;
  ctx.clearRect(0, 0, width, height);
  if (total <= 0) {
    ctx.fillStyle = '#8a8f98';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText('No spending yet', cx - 40, cy);
    return;
  }
  let angle = -Math.PI / 2;
  for (const item of slices) {
    const sweep = (item.value / total) * Math.PI * 2;
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, angle, angle + sweep);
    ctx.closePath();
    ctx.fill();
    angle += sweep;
  }
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1f2a33';
  ctx.font = '600 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Total', cx, cy - 4);
  ctx.font = '600 12px system-ui, sans-serif';
  ctx.fillText('Rp ' + (total / 1000000).toFixed(1) + ' jt', cx, cy + 13);
  ctx.textAlign = 'left';
  // Legend to the right of the ring.
  const legendX = cx + radius + 18;
  let legendY = Math.max(16, cy - (slices.length * 9));
  ctx.font = '12px system-ui, sans-serif';
  for (const item of slices) {
    if (item.value <= 0) continue;
    legendDot(ctx, legendX, legendY - 4, item.color);
    ctx.fillStyle = '#33414d';
    ctx.fillText(item.label, legendX + 10, legendY);
    ctx.fillStyle = '#6b7680';
    ctx.fillText(Math.round((item.value / total) * 100) + '%', legendX + 138, legendY);
    legendY += 18;
  }
}

// Grouped bars: income vs spending per month.
// series: [{label, income, spending}].
export function drawMonthBars(canvas, series) {
  const fitted = fitCanvas(canvas);
  if (!fitted) return;
  const { ctx, width, height } = fitted;
  const padLeft = 52;
  const padBottom = 26;
  const padTop = 12;
  const chartW = width - padLeft - 12;
  const chartH = height - padTop - padBottom;
  const max = Math.max(...series.map((m) => Math.max(m.income, m.spending))) * 1.08;
  ctx.clearRect(0, 0, width, height);
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = '#6b7680';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const value = (max / 4) * i;
    const y = padTop + chartH - (chartH / 4) * i;
    ctx.fillText('Rp ' + Math.round(value / 1000000) + ' jt', padLeft - 6, y + 4);
    ctx.strokeStyle = '#e6e2d9';
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - 12, y);
    ctx.stroke();
  }
  const slot = chartW / series.length;
  const barW = Math.min(22, (slot - 18) / 2);
  ctx.textAlign = 'center';
  series.forEach((m, i) => {
    const x0 = padLeft + slot * i + (slot - barW * 2 - 4) / 2;
    const incomeH = (m.income / max) * chartH;
    const spendH = (m.spending / max) * chartH;
    ctx.fillStyle = '#2f6f5e';
    ctx.fillRect(x0, padTop + chartH - incomeH, barW, incomeH);
    ctx.fillStyle = '#c65d4b';
    ctx.fillRect(x0 + barW + 4, padTop + chartH - spendH, barW, spendH);
    ctx.fillStyle = '#33414d';
    ctx.fillText(m.label || m.month, padLeft + slot * i + slot / 2, height - 8);
  });
  // Key.
  ctx.textAlign = 'left';
  ctx.fillStyle = '#2f6f5e';
  ctx.fillRect(width - 168, 4, 10, 10);
  ctx.fillStyle = '#33414d';
  ctx.fillText('Income', width - 154, 13);
  ctx.fillStyle = '#c65d4b';
  ctx.fillRect(width - 96, 4, 10, 10);
  ctx.fillStyle = '#33414d';
  ctx.fillText('Spending', width - 82, 13);
}

// Line chart: one series over months, e.g. savings rate or spending.
// points: [{label, value}], valueLabel formats the y axis.
export function drawLine(canvas, points, valueLabel) {
  const fitted = fitCanvas(canvas);
  if (!fitted) return;
  const { ctx, width, height } = fitted;
  const padLeft = 52;
  const padBottom = 26;
  const padTop = 14;
  const chartW = width - padLeft - 12;
  const chartH = height - padTop - padBottom;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const low = min - span * 0.15;
  const high = max + span * 0.15;
  ctx.clearRect(0, 0, width, height);
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = '#6b7680';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const value = low + ((high - low) / 4) * i;
    const y = padTop + chartH - (chartH / 4) * i;
    ctx.fillText(valueLabel(value), padLeft - 6, y + 4);
    ctx.strokeStyle = '#e6e2d9';
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - 12, y);
    ctx.stroke();
  }
  const step = points.length > 1 ? chartW / (points.length - 1) : 0;
  const coords = points.map((p, i) => ({
    x: padLeft + step * i,
    y: padTop + chartH - ((p.value - low) / (high - low)) * chartH,
  }));
  ctx.strokeStyle = '#2f6f5e';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  coords.forEach((c, i) => (i === 0 ? ctx.moveTo(c.x, c.y) : ctx.lineTo(c.x, c.y)));
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.fillStyle = '#2f6f5e';
  for (const c of coords) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2f6f5e';
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = '#33414d';
  points.forEach((p, i) => ctx.fillText(p.label, padLeft + step * i, height - 8));
}

// Horizontal comparison bars: one row per item, value against a max.
// Used on a province-style detail page and on Reports for category share.
export function drawHbars(canvas, rows) {
  const fitted = fitCanvas(canvas);
  if (!fitted) return;
  const { ctx, width, height } = fitted;
  const max = Math.max(...rows.map((r) => r.value), 1);
  const rowH = height / rows.length;
  ctx.clearRect(0, 0, width, height);
  ctx.font = '12px system-ui, sans-serif';
  rows.forEach((row, i) => {
    const y = rowH * i + rowH / 2;
    ctx.fillStyle = '#33414d';
    ctx.textAlign = 'left';
    ctx.fillText(row.label, 0, y - 2);
    ctx.fillStyle = '#e6e2d9';
    ctx.fillRect(0, y + 4, width - 90, 10);
    ctx.fillStyle = row.color || '#2f6f5e';
    ctx.fillRect(0, y + 4, Math.max(2, ((width - 90) * row.value) / max), 10);
    ctx.fillStyle = '#33414d';
    ctx.textAlign = 'right';
    ctx.fillText(row.text, width, y - 2);
  });
}
