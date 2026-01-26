// Date utilities for form date conversion
// Handles Thai Buddhist Era (พ.ศ.) and ISO date formats

// Thai month names (full)
export const thaiMonthsFull = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

// Thai month names (short)
export const thaiMonthsShort = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

/**
 * Get current Thai date components
 * @returns { date, month, year } in Thai Buddhist Era format
 */
export function getCurrentThaiDate() {
    const now = new Date();
    return {
        date: now.getDate().toString(),
        month: thaiMonthsFull[now.getMonth()],
        year: (now.getFullYear() + 543).toString()
    };
}

/**
 * Get current time in HH:MM format
 */
export function getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Convert Thai date (วัน/เดือน/ปี พ.ศ.) to ISO date string
 * @param date - Day of month
 * @param month - Thai month name (full)
 * @param year - Buddhist Era year
 * @returns ISO date string (YYYY-MM-DD) or null if invalid
 */
export function toISODate(date: string, month: string, year: string): string | null {
    if (!date || !month || !year) return null;

    const monthIndex = thaiMonthsFull.findIndex(m => m === month);
    if (monthIndex === -1) return null;

    const dayNum = parseInt(date);
    const yearNum = parseInt(year);
    if (isNaN(dayNum) || isNaN(yearNum)) return null;

    const ceYear = yearNum - 543;
    const monthStr = (monthIndex + 1).toString().padStart(2, '0');
    const dayStr = dayNum.toString().padStart(2, '0');

    return `${ceYear}-${monthStr}-${dayStr}`;
}

/**
 * Convert ISO date to Thai date components
 * @param isoDate - ISO date string (YYYY-MM-DD)
 * @returns { date, month, year } in Thai Buddhist Era format
 */
export function toThaiDate(isoDate: string): { date: string; month: string; year: string } {
    if (!isoDate) {
        return { date: '', month: '', year: '' };
    }

    const parts = isoDate.split('-');
    if (parts.length !== 3) {
        return { date: '', month: '', year: '' };
    }

    const ceYear = parseInt(parts[0]);
    const monthIndex = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);

    if (isNaN(ceYear) || isNaN(monthIndex) || isNaN(day)) {
        return { date: '', month: '', year: '' };
    }

    return {
        date: day.toString(),
        month: thaiMonthsFull[monthIndex] || '',
        year: (ceYear + 543).toString()
    };
}

/**
 * Format date for display (short format)
 * @param date - Day
 * @param month - Month index (0-11)
 * @param year - Buddhist Era year
 * @returns Formatted string like "25 ม.ค. 2568"
 */
export function formatThaiDateShort(date: string, monthIndex: number, year: string): string {
    if (!date || monthIndex < 0 || monthIndex > 11 || !year) return '';
    return `${date} ${thaiMonthsShort[monthIndex]} ${year}`;
}
