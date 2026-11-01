/**
 * Utility helpers for Fencing Supply
 */

function formatPaiseToRupees(paise) {
  return (paise / 100).toFixed(2);
}

function rupeesToPaise(rupees) {
  return Math.round(parseFloat(rupees) * 100);
}

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `FS-${ts}-${rand}`;
}

function generateQuoteNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `QT-${ts}-${rand}`;
}

function generateCollectionCode() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function addBusinessDays(date, days) {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

function isOperatingHours() {
  const now = new Date();
  const istOffset = 5.5 * 60;
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const istMinutes = (utcMinutes + istOffset) % (24 * 60);
  // 10 AM to 7 PM IST
  return istMinutes >= 600 && istMinutes <= 1140;
}

function getISTDate() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
}

module.exports = {
  formatPaiseToRupees,
  rupeesToPaise,
  generateOrderNumber,
  generateQuoteNumber,
  generateCollectionCode,
  addMinutes,
  addHours,
  addBusinessDays,
  isOperatingHours,
  getISTDate
};