"use client";

import { Mail } from "lucide-react";

export type ContactChannel = "Email" | "WhatsApp" | "Telegram" | "Line" | "Viber";

export const ALL_CONTACT_CHANNELS: ContactChannel[] = [
  "Email",
  "WhatsApp",
  "Telegram",
  "Line",
  "Viber",
];

const SIZE = 18;

function EmailIcon({ size = SIZE }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-brand text-white"
      style={{ width: size, height: size }}
      aria-label="Email"
      title="Email"
    >
      <Mail size={Math.round(size * 0.55)} strokeWidth={2} />
    </span>
  );
}

function WhatsAppIcon({ size = SIZE }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-label="WhatsApp">
      <title>WhatsApp</title>
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path
        d="M16.7 13.6c-.3-.1-1.6-.8-1.8-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.1-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.8-.7-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.2.2-.4.1-.2 0-.3 0-.4 0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.3-.8.8-.8 2 0 1.2.8 2.3.9 2.5.1.2 1.7 2.6 4.1 3.6.6.2 1 .4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.6-.6 1.8-1.3.2-.7.2-1.2.1-1.3 0-.2-.2-.2-.5-.3z"
        fill="#fff"
      />
    </svg>
  );
}

function TelegramIcon({ size = SIZE }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-label="Telegram">
      <title>Telegram</title>
      <circle cx="12" cy="12" r="12" fill="#229ED9" />
      <path
        d="M5.4 11.6c3.6-1.6 6-2.6 7.2-3.1 3.4-1.4 4.1-1.6 4.6-1.7.1 0 .3 0 .5.1.1.1.2.2.2.4 0 .1 0 .3-.1.4-.4 1.7-1.7 6.5-2.4 8.8-.3 1-.9 1.3-1.4 1.3-.4 0-.9-.2-1.4-.5-.4-.3-.9-.6-1.5-1l-1.5-1c-.1-.1-.4-.4-.1-.7l1.6-1.5c2.5-2.4 2.5-2.5 2.6-2.6 0-.1 0-.2-.1-.2-.1-.1-.2 0-.3 0-.1 0-.7.5-2.1 1.4-1.5 1-2.5 1.5-2.7 1.5-.3 0-.8-.2-1.2-.3-.5-.2-1-.3-1-.6.1-.1.1-.2.1-.7z"
        fill="#fff"
      />
    </svg>
  );
}

function LineIcon({ size = SIZE }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-label="Line">
      <title>Line</title>
      <rect width="24" height="24" rx="5" fill="#06C755" />
      <path
        d="M19.4 11.1c0-3.3-3.3-6-7.4-6S4.6 7.8 4.6 11.1c0 3 2.6 5.4 6.2 5.9.2 0 .6.2.6.4 0 .2 0 .5-.1.7l-.1.5c0 .2-.1.7.6.4.7-.3 4-2.4 5.5-4.1 1-1.1 1.5-2.3 1.5-3.8z"
        fill="#fff"
      />
      <path
        d="M16.9 9.4c.2 0 .3.1.3.3v.2H16v.4h.6c.2 0 .3.1.3.3 0 .2-.1.3-.3.3H15.7c-.2 0-.3-.1-.3-.3V9.7c0-.2.1-.3.3-.3h1.2zm-2.3 0c.2 0 .3.1.3.3v1.6c0 .1-.1.3-.2.3h-.1c-.1 0-.2 0-.2-.1L13.7 10.4v.9c0 .2-.1.3-.3.3-.2 0-.3-.1-.3-.3V9.7c0-.1.1-.3.2-.3h.1c.1 0 .2 0 .2.1l.7 1V9.7c0-.2.1-.3.3-.3zm-2.4 0c.2 0 .3.1.3.3v1.6c0 .2-.1.3-.3.3-.2 0-.3-.1-.3-.3V9.7c0-.2.1-.3.3-.3zm-.9 1.6c.2 0 .3.1.3.3 0 .2-.1.3-.3.3H10c-.2 0-.3-.1-.3-.3V9.7c0-.2.1-.3.3-.3.2 0 .3.1.3.3v1.3h1z"
        fill="#06C755"
      />
    </svg>
  );
}

function ViberIcon({ size = SIZE }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-label="Viber">
      <title>Viber</title>
      <circle cx="12" cy="12" r="12" fill="#7360F2" />
      <path
        d="M16.6 13.6c-.3-.1-1.6-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1-.1.1-.3.2-.6.1-.3-.2-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.4.1-.1.1-.2.2-.4.1-.2 0-.3 0-.4 0-.1-.6-1.5-.9-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.4-.2.3-.9.9-.9 2.1 0 1.3.9 2.5 1 2.7.1.2 1.7 2.7 4.3 3.7 2.5 1 2.5.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.2-.3-.2-.6-.3z"
        fill="#fff"
      />
    </svg>
  );
}

export function ContactChannelIcon({
  channel,
  size = SIZE,
}: {
  channel: ContactChannel;
  size?: number;
}) {
  switch (channel) {
    case "Email":    return <EmailIcon size={size} />;
    case "WhatsApp": return <WhatsAppIcon size={size} />;
    case "Telegram": return <TelegramIcon size={size} />;
    case "Line":     return <LineIcon size={size} />;
    case "Viber":    return <ViberIcon size={size} />;
  }
}

export function ContactChannelList({ channels }: { channels: ContactChannel[] }) {
  if (channels.length === 0) {
    return <span className="text-[12px] text-gray-300">—</span>;
  }
  return (
    <div className="flex items-center gap-1.5">
      {channels.map((c) => (
        <ContactChannelIcon key={c} channel={c} />
      ))}
    </div>
  );
}
