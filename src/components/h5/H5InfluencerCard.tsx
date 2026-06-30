import { InfluencerAvatar } from "@/components/InfluencerAvatar";

export function H5InfluencerCard({
  name,
  handle,
  avatar,
}: {
  name: string;
  handle: string;
  avatar: string;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-3 py-2.5">
        <InfluencerAvatar
          src={avatar}
          alt={name}
          platform="Instagram"
          size="md"
          fallback={name.slice(0, 2)}
          fallbackClassName="bg-violet-100 text-violet-700"
        />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-gray-900">{name}</p>
          <p className="truncate text-[11px] text-gray-500">{handle}</p>
        </div>
      </div>
    </section>
  );
}
