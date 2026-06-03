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
