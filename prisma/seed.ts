import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database and setting up fresh AutoMester Pro ERP...");

  // Wipe existing data cleanly
  await prisma.auditLog.deleteMany();
  await prisma.timeLog.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.workOrderItem.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplierOrder.deleteMany();
  await prisma.part.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.featureFlag.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();

  // 1. Initial Central Branch
  const mainBranch = await prisma.branch.create({
    data: {
      name: "Központi Autószerviz",
      code: "HQ-01",
      address: "1117 Budapest, Budafoki út 100.",
      city: "Budapest",
      zip: "1117",
      phone: "+36 1 234 5678",
      email: "szerviz@automesterpro.hu",
      bayCount: 4,
      isMain: true,
    },
  });

  // 2. Default Roles / Users
  await prisma.user.create({
    data: {
      email: "admin@automester.hu",
      name: "Műhelyvezető István",
      role: "ADMIN",
      branchId: mainBranch.id,
      pinCode: "1234",
    },
  });

  await prisma.user.create({
    data: {
      email: "szerelo@automester.hu",
      name: "Szerelő Tamás",
      role: "MECHANIC",
      branchId: mainBranch.id,
      pinCode: "2222",
    },
  });

  await prisma.user.create({
    data: {
      email: "recepcio@automester.hu",
      name: "Munkafelvevő Gábor",
      role: "RECEPTIONIST",
      branchId: mainBranch.id,
      pinCode: "3333",
    },
  });

  // 3. The 16 Modular Feature Flags
  const defaultFlags = [
    { key: "crm", label: "Ügyfélkezelés (CRM)", description: "Ügyféladatok, cégadatok, adószám, kapcsolattartási előzmények", isEnabled: true, category: "core" },
    { key: "vehicles", label: "Járműnyilvántartás & VIN Dekóder", description: "Rendszám, alvázszám, műszaki adatok, digitális szervizkönyv", isEnabled: true, category: "core" },
    { key: "calendar", label: "Naptár & Emelőállások", description: "Időpontfoglalás, emelőbeosztás, szerelői naptár", isEnabled: true, category: "workshop" },
    { key: "work_orders", label: "Munkalapkezelés", description: "Munkalap státuszgép, tételek rögzítése, belső jegyzetek", isEnabled: true, category: "workshop" },
    { key: "inspections", label: "Digitális Állapotfelmérés", description: "Karosszéria sérüléstérkép, fék, futómű és folyadék checklist", isEnabled: true, category: "workshop" },
    { key: "quotes", label: "Árajánlat & Ügyfél Jóváhagyás", description: "Online jóváhagyó link ügyfeleknek digitális aláírással", isEnabled: true, category: "finance" },
    { key: "inventory", label: "Alkatrész- és Raktárkezelés", description: "Cikkszámok, készletszintek, min készlet riasztás, polchelyek", isEnabled: true, category: "workshop" },
    { key: "suppliers", label: "Beszállítók Kezelése", description: "Unix, Bárdi, Inter Cars megrendelések", isEnabled: true, category: "workshop" },
    { key: "time_tracking", label: "Munkaidő & Stopperóra", description: "Élő szerelői stopperóra és munkaidő napló", isEnabled: true, category: "workshop" },
    { key: "invoicing", label: "Számlázás & Pénzügyek", description: "1-kattintásos számlázás, Billingo/Számlázz.hu integráció", isEnabled: true, category: "finance" },
    { key: "reminders", label: "Automatikus Szervizemlékeztetők", description: "Olajcsere (15.000km/1év), műszaki vizsga lejárati értesítők", isEnabled: true, category: "core" },
    { key: "customer_portal", label: "Ügyfél Portál", description: "Ügyfelek saját belépési felülete és digitális szervizkönyve", isEnabled: true, category: "core" },
    { key: "live_tracking", label: "Élő Szervizkövető Oldal", description: "Publikus élő nyomkövető timeline az autó állapotáról", isEnabled: true, category: "smart" },
    { key: "warranties", label: "Garanciakezelés", description: "Beépített alkatrész és munkadíj jótállási időszakok", isEnabled: true, category: "finance" },
    { key: "multi_branch", label: "Több Telephely Támogatása", description: "Telephelyváltó, telephelyi raktárak és emelők", isEnabled: true, category: "smart" },
    { key: "ai_assistant", label: "AI Műhely Asszisztens", description: "Intelligens hibaleírás formázó és ügyféltájékoztató szöveggenerátor", isEnabled: true, category: "smart" },
  ];

  for (const flag of defaultFlags) {
    await prisma.featureFlag.create({ data: flag });
  }

  // 4. Default System Settings
  const settings = [
    { key: "company_name", label: "Cégnév", value: "AutoMester Szerviz Kft.", group: "general" },
    { key: "company_tax_number", label: "Céges Adószám", value: "12345678-2-42", group: "finance" },
    { key: "default_hourly_rate", label: "Alapértelmezett óradíj", value: "15000", group: "finance" },
    { key: "default_vat_rate", label: "ÁFA kulcs", value: "27", group: "finance" },
    { key: "currency", label: "Pénznem", value: "HUF", group: "finance" },
  ];

  for (const s of settings) {
    await prisma.systemSetting.create({ data: s });
  }

  console.log("Fresh, clean database successfully initialized with zero dummy data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
