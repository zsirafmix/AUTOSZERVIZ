# AutoMester Pro ERP 🚗🔧
> Professzionális, Felhőalapú Autószerelő Nyilvántartó és Műhelyirányítási Rendszer

Az **AutoMester Pro ERP** egy modern, moduláris webalkalmazás, amely a teljes autószerviz folyamatot lefedi:
**Ügyfélfelvétel (CRM) ➔ Járműnyilvántartás & VIN dekóder ➔ Időpontfoglalás ➔ Munkalapkezelés & Státuszgép ➔ Digitális Állapotfelmérés (Sérüléstérkép) ➔ Árajánlat & Ügyfél-Jóváhagyás ➔ Alkatrész & Raktárkezelés ➔ Beszállítók (Unix, Bárdi, IC) ➔ Szerelői Stopperóra (Munkaidő) ➔ Számlázás (Billingo/Számlázz.hu) ➔ Automatikus Emlékeztetők ➔ Ügyfél Portál ➔ Élő Nyomkövető ➔ Vezetői KPI Dashboard**.

---

## ⚙️ Moduláris Funkciókapcsolók (Feature Flags)

A rendszerben **mind a 16 modul egyenként ki- és bekapcsolható** az Admin Beállítások menüben (`/settings`):

1. `crm` - **Ügyfélkezelés (CRM)** (Cégadatok, adószám, kapcsolattartás)
2. `vehicles` - **Járműnyilvántartás & VIN Dekóder** (Műszaki adatok, fotók)
3. `calendar` - **Naptár & Emelőállások** (Műhelybeosztás, online foglaló)
4. `work_orders` - **Munkalapkezelés** (Státuszgép, tételek, PDF nyomtatás)
5. `inspections` - **Digitális Állapotfelmérés** (Karosszéria sérüléstérkép, fék/folyadék checklist)
6. `quotes` - **Árajánlat & Online Ügyfél Jóváhagyás** (Időbélyeges aláírás)
7. `inventory` - **Alkatrész- és Raktárkezelés** (Cikkszámok, min. készletszint riasztás)
8. `suppliers` - **Beszállítók Kezelése** (Unix, Bárdi, Inter Cars megrendelések)
9. `time_tracking` - **Munkaidő & Stopperóra** (Élő Start/Stop szerelői időmérő)
10. `invoicing` - **Számlázás & Pénzügyek** (1-kattintásos számla, Billingo/Számlázz export)
11. `reminders` - **Automatikus Szervizemlékeztetők** (Olajcsere, műszaki lejárata)
12. `customer_portal` - **Ügyfél Portál** (Saját járművek, szervizkönyv)
13. `live_tracking` - **Élő Szervizkövető Oldal** (Animált fázisjelző timeline)
14. `warranties` - **Garanciakezelés** (Alkatrész és munkadíj jótállás)
15. `multi_branch` - **Több Telephely Támogatása** (Központ, telephelyi raktárak)
16. `ai_assistant` - **AI Műhely Asszisztens** (Hibaleírás formázás & ügyfélszöveg)

---

## 🚀 Helyi Futtatás (Local Development)

```bash
# Függőségek telepítése
npm install

# Adatbázis létrehozása és mintadatok betöltése
npx prisma db push
npx prisma db seed

# Fejlesztői szerver indítása
npm run dev
```
A böngészőben nyissa meg: `http://localhost:3000`

---

## 🌐 Telepítés Render.com-ra (Render Deployment)

1. Hozzon létre egy új **Web Service**-t a [Render.com](https://render.com) felületén.
2. Kapcsolja össze a GitHub repository-val.
3. Válassza a **Node** környezetet vagy használja a `render.yaml` Blueprintet.
4. Állítsa be a parancsokat:
   - **Build Command**: `npm install && npx prisma db push && npx prisma db seed && npm run build`
   - **Start Command**: `npm start`
5. Környezeti változók:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = `file:./dev.db`
6. Kattintson a **Deploy** gombra!

---

## 📱 Okosfunkciók & Műhely Eszközök

- **Műhely Tablet Nézet (`/workshop`)**: Érintőképernyős nagygombos UI, szerelőváltás PIN kóddal, aktív stopper.
- **Kamerás QR / Vonalkód Beolvasó**: Másodpercek alatt megnyitja a munkalapot a kinyomtatott QR kód beolvasásával.
- **Interaktív Autó Sérüléstérkép**: Kattintható karosszéria diagram felülnézetből és oldalnézetből.
- **Élő Szerviz Státuszkövető (`/track/[token]`)**: Az ügyfél telefonján valós időben látja az autója állapotát telefonálás nélkül.
