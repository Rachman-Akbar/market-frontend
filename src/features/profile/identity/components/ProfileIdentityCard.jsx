export function ProfileIdentityCard({ user = null }) {
  const name = user?.name || "Pengguna";
  const email = user?.email || "Email belum tersedia";
  const avatar = user?.avatar || user?.photoURL || "";

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        {avatar ? (
          <img src={avatar} alt={name} className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#03ac0e] text-base font-bold text-white">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-gray-900">{name}</p>
          <p className="truncate text-xs text-gray-500">{email}</p>
        </div>
      </div>
    </div>
  );
}
