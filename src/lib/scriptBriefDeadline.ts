export type ScriptBriefDeadline = {
  date: string;
  time?: string;
  timezone?: string;
};

export function formatDeadlineDisplayTime(time: string) {
  const [hourText, minuteText] = time.split(":");
  const hours = Number(hourText);
  const minutes = Number(minuteText);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;

  const stamp = new Date();
  stamp.setHours(hours, minutes, 0, 0);
  return stamp.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function parseLegacyDeadlineLabel(label: string): ScriptBriefDeadline {
  const trimmed = label.trim();
  if (!trimmed) return { date: "" };

  const structuredMatch = trimmed.match(
    /^(.+?\d{4})\s+(\d{1,2}:\d{2}(?:\s?[AP]M)?)\s+((?:UTC|GMT)[^\s]+)$/i
  );
  if (structuredMatch) {
    const [, date, rawTime, timezone] = structuredMatch;
    const time = /[AP]M/i.test(rawTime)
      ? rawTime
      : formatDeadlineDisplayTime(rawTime);
    return {
      date: date.trim(),
      time,
      timezone: timezone.trim(),
    };
  }

  return { date: trimmed };
}

export function hasScriptBriefDeadline(deadline: ScriptBriefDeadline) {
  return Boolean(deadline.date.trim());
}

/** Maps brief deadline (display or ISO) to form fields for date/time inputs. */
export function scriptBriefDeadlineToSubmissionDeadline(deadline: ScriptBriefDeadline): {
  date: string;
  time: string;
  timezone: string;
} {
  const timezone = deadline.timezone?.trim() ?? "";
  const dateStr = deadline.date.trim();
  if (!dateStr) {
    return { date: "", time: "", timezone };
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return {
      date: dateStr,
      time: parseDeadlineTimeForInput(deadline.time),
      timezone,
    };
  }

  const parsedDate = new Date(dateStr);
  if (!Number.isNaN(parsedDate.getTime())) {
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");
    return {
      date: `${year}-${month}-${day}`,
      time: parseDeadlineTimeForInput(deadline.time),
      timezone,
    };
  }

  const legacy = parseLegacyDeadlineLabel(
    [dateStr, deadline.time, timezone].filter(Boolean).join(" ")
  );
  const legacyDate = legacy.date.trim();
  const legacyParsed = legacyDate ? new Date(legacyDate) : null;
  if (legacyParsed && !Number.isNaN(legacyParsed.getTime())) {
    const year = legacyParsed.getFullYear();
    const month = String(legacyParsed.getMonth() + 1).padStart(2, "0");
    const day = String(legacyParsed.getDate()).padStart(2, "0");
    return {
      date: `${year}-${month}-${day}`,
      time: parseDeadlineTimeForInput(legacy.time),
      timezone: legacy.timezone?.trim() ?? timezone,
    };
  }

  return { date: "", time: "", timezone };
}

function parseDeadlineTimeForInput(time?: string): string {
  if (!time?.trim()) return "";

  const trimmed = time.trim();
  const twentyFourHour = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (twentyFourHour && !/[AP]M/i.test(trimmed)) {
    const hours = Number(twentyFourHour[1]);
    const minutes = twentyFourHour[2];
    if (hours >= 0 && hours <= 23) {
      return `${String(hours).padStart(2, "0")}:${minutes}`;
    }
  }

  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hours = Number(ampmMatch[1]);
    const minutes = ampmMatch[2];
    const meridiem = ampmMatch[3].toUpperCase();
    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  return "";
}
