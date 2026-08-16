import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMyNotificationsAction, markAllNotificationsReadAction } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const notifications = await getMyNotificationsAction();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b border-line pb-5">
        <div>
          <div className="font-display text-[10px] tracking-[0.3em] text-gold-deep">— INBOX —</div>
          <h1 className="font-display text-4xl md:text-5xl"><span className="text-gold-metal">NOTIFIKASI</span></h1>
        </div>
        <form action={markAllNotificationsReadAction}>
          <button type="submit" className="btn-ghost text-[10px]">Tandai Semua Dibaca</button>
        </form>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className={`card-luxe p-5 ${n.read ? "opacity-60" : "border-l-4 border-l-gold bg-gold/5"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className={`font-display text-[10px] tracking-[0.3em] ${n.type === "promo" ? "text-gold" : n.type === "warning" ? "text-wine-light" : "text-ivory/70"}`}>{n.title}</div>
                <p className="mt-1 text-sm text-ivory/80">{n.message}</p>
                <div className="mt-2 text-[10px] text-ivory/40">{new Date(n.createdAt).toLocaleString("id-ID")}</div>
              </div>
              {!n.read && <span className="h-2 w-2 rounded-full bg-gold" />}
            </div>
          </div>
        ))}
        {notifications.length === 0 && <div className="card-luxe p-10 text-center font-serif-italic text-ivory/40">Tidak ada notifikasi</div>}
      </div>
    </div>
  );
}
