/**
 * Utility to calculate validity window expiration status for ZFOD oil field permits.
 */
export interface ValidityStatus {
  isExpired: boolean;
  isExpiringSoon: boolean; // Less than 60 minutes remaining
  remainingMinutes: number;
  labelEn: string;
  labelAr: string;
}

export function checkPermitValidity(validityWindowStr: string): ValidityStatus {
  if (!validityWindowStr) {
    return {
      isExpired: false,
      isExpiringSoon: false,
      remainingMinutes: 300,
      labelEn: 'Valid',
      labelAr: 'صالح',
    };
  }

  // Look for end time formatted like "18:00" or "06:00"
  const timeMatches = validityWindowStr.match(/(\d{1,2}):(\d{2})/g);
  if (!timeMatches || timeMatches.length === 0) {
    return {
      isExpired: false,
      isExpiringSoon: false,
      remainingMinutes: 300,
      labelEn: 'Valid Shift',
      labelAr: 'وردية صالحة',
    };
  }

  // End time is usually the last match
  const endTimeStr = timeMatches[timeMatches.length - 1];
  const [endHour, endMinute] = endTimeStr.split(':').map(Number);

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const endTotalMinutes = endHour * 60 + endMinute;

  let diffMinutes = endTotalMinutes - currentMinutes;

  // If shift ends tomorrow morning (e.g., night shift 18:00 - 06:00)
  if (diffMinutes < -720) {
    diffMinutes += 1440;
  }

  if (diffMinutes <= 0) {
    return {
      isExpired: true,
      isExpiringSoon: false,
      remainingMinutes: 0,
      labelEn: 'EXPIRED (Shift Ended)',
      labelAr: 'منتهي الصلاحية (انتهت الوردية)',
    };
  }

  if (diffMinutes <= 60) {
    return {
      isExpired: false,
      isExpiringSoon: true,
      remainingMinutes: diffMinutes,
      labelEn: `Expiring Soon (${diffMinutes}m)`,
      labelAr: `ينتهي قريباً (متبقي ${diffMinutes} د)`,
    };
  }

  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  return {
    isExpired: false,
    isExpiringSoon: false,
    remainingMinutes: diffMinutes,
    labelEn: `Valid (${hours}h ${mins}m left)`,
    labelAr: `صالح (متبقي ${hours} س و ${mins} د)`,
  };
}
