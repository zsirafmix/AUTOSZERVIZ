import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with AutoMester Pro ERP data...");

  // 1. Feature Flags
  const featureFlags = [
    { key: "crm", label: "Ügyfélkezelés (CRM)", description: "Ügyféltörzs, cégadatok, kommunikációs előzmények és kedvezmények.", category: "core", sortOrder: 1 },
    { key: "vehicles", label: "Járműnyilvántartás & VIN", description: "Részletes autó adatok, VIN dekóder, műszaki adatok és fotók.", category: "core", sortOrder: 2 },
    { key: "calendar", label: "Időpontfoglalás & Naptár", description: "Műhely naptár, emelőállások, szerelői beosztás és online foglaló.", category: "core", sortOrder: 3 },
    { key: "work_orders", label: "Munkalapkezelés", description: "Teljes szerviz munkafolyamat státuszgép, hibaleírás, műveletek, PDF export.", category: "workshop", sortOrder: 4 },
    { key: "inspections", label: "Digitális Állapotfelmérés", description: "Karosszéria sérüléstérkép, fék/futómű/folyadék checklist, fotódokumentáció.", category: "workshop", sortOrder: 5 },
    { key: "quotes", label: "Árajánlat & Ügyfél Jóváhagyás", description: "Kalkuláció, védett online link, ügyfél jóváhagyás és aláírás naplózás.", category: "workshop", sortOrder: 6 },
    { key: "inventory", label: "Alkatrész- & Raktárkezelés", description: "Cikkszámok, készlet, polchelyek, minimum készletszint riasztás, automata levonás.", category: "workshop", sortOrder: 7 },
    { key: "suppliers", label: "Beszállítók Kezelése", description: "Unix, Bárdi, Inter Cars partnerek, beszerzési megrendelések nyilvántartása.", category: "workshop", sortOrder: 8 },
    { key: "time_tracking", label: "Munkaidő & Stopperóra", description: "Szerelői élő Start/Stop stopperóra munkalaponként, hatékonyságmérés.", category: "workshop", sortOrder: 9 },
    { key: "invoicing", label: "Számlázás & Pénzügyek", description: "1-kattintásos számla/díjbekérő, fizetési módok, Billingo / Számlázz.hu export.", category: "finance", sortOrder: 10 },
    { key: "reminders", label: "Automatikus Emlékeztetők", description: "Km- és időalapú olajcsere, műszaki vizsga, fékfolyadék, klímatisztítás értesítők.", category: "smart", sortOrder: 11 },
    { key: "customer_portal", label: "Ügyfél Portál", description: "Ügyfelek saját fiókja járművekkel, szervizkönyvvel, számlákkal.", category: "smart", sortOrder: 12 },
    { key: "live_tracking", label: "Élő Szervizkövető Link", description: "Publikus követőkód valós idejű státuszjelzővel az autó javításáról.", category: "smart", sortOrder: 13 },
    { key: "warranties", label: "Garanciakezelés", description: "Beépített alkatrész és munkadíj jótállási időszakok nyilvántartása.", category: "workshop", sortOrder: 14 },
    { key: "multi_branch", label: "Több Telephely Támogatása", description: "Telephelyek közötti váltás, független készlet és emelőállások.", category: "core", sortOrder: 15 },
    { key: "ai_assistant", label: "AI Műhely Asszisztens", description: "Szerelői hibaleírás rendszerező és ügyfélbarát szervizösszefoglaló generátor.", category: "smart", sortOrder: 16 }
  ];

  for (const flag of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: { label: flag.label, description: flag.description, category: flag.category, sortOrder: flag.sortOrder },
      create: { ...flag, isEnabled: true }
    });
  }

  // 2. Telephelyek (Branches)
  const branchMain = await prisma.branch.upsert({
    where: { code: "BP-11" },
    update: {},
    create: {
      name: "AutoMester Központ - Budapest XI.",
      code: "BP-11",
      address: "Hunyadi János út 16.",
      city: "Budapest",
      zip: "1117",
      phone: "+36 1 450 1234",
      email: "buda@automesterpro.hu",
      taxNumber: "12345678-2-43",
      isMain: true,
      bayCount: 4
    }
  });

  const branchNorth = await prisma.branch.upsert({
    where: { code: "BP-14" },
    update: {},
    create: {
      name: "AutoMester Észak - Budapest XIV.",
      code: "BP-14",
      address: "Kerepesi út 120.",
      city: "Budapest",
      zip: "1144",
      phone: "+36 1 789 5678",
      email: "pest@automesterpro.hu",
      taxNumber: "12345678-2-43",
      isMain: false,
      bayCount: 3
    }
  });

  // 3. Felhasználók (Users / Workers)
  const userAdmin = await prisma.user.upsert({
    where: { email: "admin@automesterpro.hu" },
    update: {},
    create: {
      name: "Kovács István",
      email: "admin@automesterpro.hu",
      phone: "+36 30 123 4567",
      role: "ADMIN",
      pinCode: "1234",
      branchId: branchMain.id
    }
  });

  const userReception = await prisma.user.upsert({
    where: { email: "recepcio@automesterpro.hu" },
    update: {},
    create: {
      name: "Varga Péter",
      email: "recepcio@automesterpro.hu",
      phone: "+36 30 234 5678",
      role: "RECEPTIONIST",
      pinCode: "2222",
      branchId: branchMain.id
    }
  });

  const userMechanic1 = await prisma.user.upsert({
    where: { email: "gabor.toth@automesterpro.hu" },
    update: {},
    create: {
      name: "Tóth Gábor",
      email: "gabor.toth@automesterpro.hu",
      phone: "+36 30 345 6789",
      role: "MECHANIC",
      pinCode: "3333",
      branchId: branchMain.id
    }
  });

  const userMechanic2 = await prisma.user.upsert({
    where: { email: "zoltan.szabo@automesterpro.hu" },
    update: {},
    create: {
      name: "Szabó Zoltán",
      email: "zoltan.szabo@automesterpro.hu",
      phone: "+36 30 456 7890",
      role: "MECHANIC",
      pinCode: "4444",
      branchId: branchMain.id
    }
  });

  const userWarehouse = await prisma.user.upsert({
    where: { email: "raktar@automesterpro.hu" },
    update: {},
    create: {
      name: "Kiss Ferenc",
      email: "raktar@automesterpro.hu",
      phone: "+36 30 567 8901",
      role: "WAREHOUSE",
      pinCode: "5555",
      branchId: branchMain.id
    }
  });

  // 4. Beszállítók (Suppliers)
  const supplierUnix = await prisma.supplier.create({
    data: {
      name: "Unix Autó Kft.",
      code: "UNIX",
      contactPerson: "Németh Balázs",
      email: "rendeles@unixauto.hu",
      phone: "+36 1 432 1000",
      website: "https://www.unixauto.hu",
      apiType: "UNIX",
      discountRate: 35
    }
  });

  const supplierBardi = await prisma.supplier.create({
    data: {
      name: "Bárdi Autó Zrt.",
      code: "BARDI",
      contactPerson: "Horváth László",
      email: "ugyfelszolgalat@bardiauto.hu",
      phone: "+36 1 345 6700",
      website: "https://www.bardiauto.hu",
      apiType: "BARDI",
      discountRate: 38
    }
  });

  const supplierIntercars = await prisma.supplier.create({
    data: {
      name: "Inter Cars Hungária Kft.",
      code: "IC",
      contactPerson: "Takács Zsolt",
      email: "info@intercars.hu",
      phone: "+36 1 200 4000",
      website: "https://www.intercars.hu",
      apiType: "IC",
      discountRate: 40
    }
  });

  // 5. Raktári Alkatrészek (Parts)
  const partsData = [
    { partNumber: "BOSCH-0986479098", oemNumber: "1K0615301T", name: "Féktárcsa első hűtött (288mm)", category: "Fékrendszer", manufacturer: "Bosch", purchasePriceNet: 14500, sellingPriceNet: 23900, stockQuantity: 6, minStockQuantity: 2, shelfLocation: "F-01-02", supplierId: supplierUnix.id, branchId: branchMain.id },
    { partNumber: "BREM-P85072", oemNumber: "5Q0698151", name: "Fékbetét készlet első", category: "Fékrendszer", manufacturer: "Brembo", purchasePriceNet: 9800, sellingPriceNet: 16900, stockQuantity: 8, minStockQuantity: 3, shelfLocation: "F-01-03", supplierId: supplierBardi.id, branchId: branchMain.id },
    { partNumber: "MANN-HU7008Z", oemNumber: "03N115562", name: "Olajszűrő betét", category: "Szűrők", manufacturer: "Mann-Filter", purchasePriceNet: 2400, sellingPriceNet: 4900, stockQuantity: 15, minStockQuantity: 5, shelfLocation: "SZ-02-01", supplierId: supplierUnix.id, branchId: branchMain.id },
    { partNumber: "MANN-C30005", oemNumber: "5Q0129620B", name: "Levegőszűrő", category: "Szűrők", manufacturer: "Mann-Filter", purchasePriceNet: 3600, sellingPriceNet: 6900, stockQuantity: 10, minStockQuantity: 4, shelfLocation: "SZ-02-02", supplierId: supplierUnix.id, branchId: branchMain.id },
    { partNumber: "MANN-FP26009", oemNumber: "5Q0819653", name: "Aktívszenes pollenszűrő (FreciousPlus)", category: "Szűrők", manufacturer: "Mann-Filter", purchasePriceNet: 4800, sellingPriceNet: 8900, stockQuantity: 12, minStockQuantity: 4, shelfLocation: "SZ-02-03", supplierId: supplierIntercars.id, branchId: branchMain.id },
    { partNumber: "CAST-5W30-LL", oemNumber: "VW 504.00/507.00", name: "Castrol EDGE 5W-30 LL Motorolaj (1L)", category: "Kenőanyagok", manufacturer: "Castrol", purchasePriceNet: 3100, sellingPriceNet: 5900, stockQuantity: 45, minStockQuantity: 15, shelfLocation: "O-01-01", supplierId: supplierBardi.id, branchId: branchMain.id },
    { partNumber: "MOTUL-8100-5W40", oemNumber: "ACEA C3 / API SN", name: "Motul 8100 X-clean 5W-40 Motorolaj (5L)", category: "Kenőanyagok", manufacturer: "Motul", purchasePriceNet: 13900, sellingPriceNet: 24900, stockQuantity: 14, minStockQuantity: 4, shelfLocation: "O-01-02", supplierId: supplierUnix.id, branchId: branchMain.id },
    { partNumber: "CONT-CT1168K1", oemNumber: "04L198119A", name: "Vezérműszíj készlet vízpumpával", category: "Motor", manufacturer: "Continental Contitech", purchasePriceNet: 46000, sellingPriceNet: 78000, stockQuantity: 2, minStockQuantity: 1, shelfLocation: "M-03-01", supplierId: supplierUnix.id, branchId: branchMain.id },
    { partNumber: "NGK-PZKER7A8EGS", oemNumber: "04E905601B", name: "Gyújtógyertya platina-irídium", category: "Gyújtás", manufacturer: "NGK", purchasePriceNet: 3800, sellingPriceNet: 6800, stockQuantity: 16, minStockQuantity: 8, shelfLocation: "GY-01-04", supplierId: supplierIntercars.id, branchId: branchMain.id },
    { partNumber: "ATE-DOT4-TYP200", oemNumber: "DOT 4 High Perf", name: "ATE SL6 DOT4 Fékfolyadék (1L)", category: "Fékrendszer", manufacturer: "ATE", purchasePriceNet: 2900, sellingPriceNet: 5500, stockQuantity: 9, minStockQuantity: 3, shelfLocation: "F-02-01", supplierId: supplierBardi.id, branchId: branchMain.id }
  ];

  const createdParts: any = {};
  for (const part of partsData) {
    const p = await prisma.part.create({ data: part });
    createdParts[p.partNumber] = p;
  }

  // 6. Ügyfelek (Customers)
  const cust1 = await prisma.customer.create({
    data: {
      name: "Fekete Tamás",
      phone: "+36 20 445 6789",
      email: "tamas.fekete@gmail.com",
      address: "Bartók Béla út 45. 2/4.",
      city: "Budapest",
      zip: "1114",
      notes: "Mindig prémium alkatrészeket kér, telefonon keresendő.",
      discountRate: 5
    }
  });

  const cust2 = await prisma.customer.create({
    data: {
      name: "Molnár Erika",
      phone: "+36 30 889 1234",
      email: "erika.molnar@freemail.hu",
      address: "Fehérvári út 88.",
      city: "Budapest",
      zip: "1119",
      notes: "Munkaidő után tudja csak átvenni az autót."
    }
  });

  const cust3 = await prisma.customer.create({
    data: {
      name: "Dr. Balogh András",
      isCompany: true,
      companyName: "Balogh Flotta és Logisztika Kft.",
      taxNumber: "23456789-2-41",
      phone: "+36 70 334 5566",
      email: "flotta@baloghlog.hu",
      address: "Nagytétényi út 112.",
      city: "Budapest",
      zip: "1222",
      notes: "Céges flottaügyfél, 4 autóval, átutalásos fizetés 8 nap.",
      discountRate: 10
    }
  });

  // 7. Járművek (Vehicles)
  const veh1 = await prisma.vehicle.create({
    data: {
      customerId: cust1.id,
      licensePlate: "AA-BC-123",
      vin: "WVWZZZAUZHP123456",
      brand: "Volkswagen",
      model: "Golf VII Variant 2.0 TDI",
      year: 2018,
      engineCode: "CRLB",
      displacementCc: 1968,
      powerKw: 110,
      powerHp: 150,
      fuelType: "Diesel",
      transmission: "DSG Automata",
      color: "Fém szürke",
      mileage: 184200,
      motExpiry: new Date("2026-11-15"),
      insuranceExpiry: new Date("2026-12-31"),
      tireSize: "205/55 R16 91V",
      notes: "Következő olajcsere esedékes 190.000 km-nél."
    }
  });

  const veh2 = await prisma.vehicle.create({
    data: {
      customerId: cust2.id,
      licensePlate: "NXZ-842",
      vin: "WAUZZZF27JA098765",
      brand: "Audi",
      model: "A4 Avant 2.0 TFSI",
      year: 2017,
      engineCode: "CVKB",
      displacementCc: 1984,
      powerKw: 140,
      powerHp: 190,
      fuelType: "Petrol",
      transmission: "S-Tronic 7 sebességes",
      color: "Fekete gyöngyház",
      mileage: 142300,
      motExpiry: new Date("2026-06-20"),
      insuranceExpiry: new Date("2026-10-15"),
      tireSize: "225/50 R17 94Y",
      notes: "Féktárcsák kopottak, jobb első kerék felől kopogás."
    }
  });

  const veh3 = await prisma.vehicle.create({
    data: {
      customerId: cust3.id,
      licensePlate: "SKD-505",
      vin: "TMBJJ7NE9H0123456",
      brand: "Skoda",
      model: "Octavia Combi 1.6 TDI",
      year: 2020,
      engineCode: "DGTE",
      displacementCc: 1598,
      powerKw: 85,
      powerHp: 115,
      fuelType: "Diesel",
      transmission: "Manual 5",
      color: "Hófehér",
      mileage: 215000,
      motExpiry: new Date("2027-02-10"),
      insuranceExpiry: new Date("2027-01-01"),
      tireSize: "205/55 R16",
      notes: "Céges területi képviselő autója, rendszeres 15k km szerviz."
    }
  });

  // 8. Munkalapok (WorkOrders)
  // WorkOrder 1: Javítás alatt (In Progress) - Audi A4
  const wo1 = await prisma.workOrder.create({
    data: {
      orderNumber: "ML-2026-0089",
      branchId: branchMain.id,
      customerId: cust2.id,
      vehicleId: veh2.id,
      mechanicId: userMechanic1.id,
      status: "IN_PROGRESS",
      priority: "HIGH",
      issueDescription: "Fékezéskor ráz a kormány és jobb elölről fémes kopogás hallatszik fekvőrendőrön.",
      diagnosis: "Első féktárcsák vastagsága határérték alatt (21.4mm), jobb első alsó lengőkar szilent szakadt.",
      internalNotes: "A szilent cseréhez melegíteni kellett a csavart. Futóműállítás is szükséges lesz a végén.",
      publicNotes: "Első fékrendszer komplett felújítása (tárcsák + betétek), jobb első lengőkar szilent csere, futómű geometria beállítás.",
      mileageAtService: 142300,
      fuelLevel: 65,
      trackingToken: "tk_audi_89_live",
      quoteStatus: "ACCEPTED",
      quoteAcceptedAt: new Date(Date.now() - 3600000 * 4),
      quoteAcceptedBy: "Molnár Erika (Online jóváhagyás)",
      laborCostNet: 32000,
      partsCostNet: 40800,
      totalNet: 72800,
      totalVat: 19656,
      totalGross: 92456,
      estimatedHours: 2.5,
      actualHours: 1.8,
      scheduledStart: new Date(Date.now() - 3600000 * 5),
      scheduledEnd: new Date(Date.now() + 3600000 * 2),
      warrantyPartsMonths: 24,
      warrantyLaborMonths: 12
    }
  });

  // Tételek wo1-hez
  await prisma.workOrderItem.create({
    data: {
      workOrderId: wo1.id,
      type: "PART",
      name: "BOSCH Féktárcsa első hűtött (288mm)",
      itemCode: "BOSCH-0986479098",
      quantity: 2,
      unit: "db",
      unitPriceNet: 23900,
      vatRate: 27,
      totalGross: 60706,
      partId: createdParts["BOSCH-0986479098"].id,
      isCompleted: true
    }
  });

  await prisma.workOrderItem.create({
    data: {
      workOrderId: wo1.id,
      type: "PART",
      name: "Brembo Fékbetét készlet első",
      itemCode: "BREM-P85072",
      quantity: 1,
      unit: "készlet",
      unitPriceNet: 16900,
      vatRate: 27,
      totalGross: 21463,
      partId: createdParts["BREM-P85072"].id,
      isCompleted: true
    }
  });

  await prisma.workOrderItem.create({
    data: {
      workOrderId: wo1.id,
      type: "LABOR",
      name: "Első fék komplett csere (tárcsák + betétek tisztítással, kenéssel)",
      itemCode: "MUNK-FEK-01",
      quantity: 1.5,
      unit: "óra",
      unitPriceNet: 14000,
      vatRate: 27,
      totalGross: 26670,
      isCompleted: true
    }
  });

  await prisma.workOrderItem.create({
    data: {
      workOrderId: wo1.id,
      type: "LABOR",
      name: "Jobb első lengőkar szilent csere + futómű ellenőrzés",
      itemCode: "MUNK-FUT-02",
      quantity: 1.0,
      unit: "óra",
      unitPriceNet: 11000,
      vatRate: 27,
      totalGross: 13970,
      isCompleted: false
    }
  });

  // Stopper / TimeLog wo1-hez (aktívan fut)
  await prisma.timeLog.create({
    data: {
      workOrderId: wo1.id,
      workerId: userMechanic1.id,
      startTime: new Date(Date.now() - 3600000 * 1.5),
      durationMinutes: 90,
      isRunning: true,
      notes: "Fékszerelés befejezve, lengőkar szilent préselés folyamatban."
    }
  });

  // Állapotfelmérés (Inspection) wo1-hez
  await prisma.inspection.create({
    data: {
      workOrderId: wo1.id,
      vehicleId: veh2.id,
      inspectorName: "Tóth Gábor",
      odometer: 142300,
      fuelLevelPercent: 65,
      damagePointsJson: JSON.stringify([
        { id: "dp1", x: 22, y: 35, view: "front_right", type: "SCRATCH", severity: "LIGHT", note: "Kisebb felületi karc a jobb első sárvédőíven" },
        { id: "dp2", x: 78, y: 60, view: "rear_bumper", type: "DENT", severity: "MEDIUM", note: "Parkolási horpadás 3cm a hátsó lökhárító jobb oldalán" }
      ]),
      checklistJson: JSON.stringify({
        brakes: { status: "WARNING", notes: "Első tárcsák vállasak és kopottak, hátsó fék 60%-os." },
        tires: { status: "GOOD", notes: "225/50 R17 Continental PremiumContact 6, profildélység 5.2mm körben." },
        lights: { status: "GOOD", notes: "Minden fényszóró, index és féklámpa működik." },
        fluids: { status: "GOOD", notes: "Hűtőfolyadék -35C, fékfolyadék forráspont 210C (megfelelő)." },
        battery: { status: "GOOD", notes: "12.6V nyugalmi, 14.2V töltés - Akku jó (84% SOH)." },
        suspension: { status: "WARNING", notes: "Jobb első alsó szilent repedezett, cserére szorul." }
      }),
      overallStatus: "WARNING",
      summaryNotes: "Fék és futómű beavatkozást igényel, egyéb tekintetben megkímélt állapotú gépjármű.",
      signatureCustomer: "Molnár Erika",
      signatureInspector: "Tóth Gábor"
    }
  });

  // WorkOrder 2: Kész / Átadva (Completed) - VW Golf VII (Számlázva)
  const wo2 = await prisma.workOrder.create({
    data: {
      orderNumber: "ML-2026-0082",
      branchId: branchMain.id,
      customerId: cust1.id,
      vehicleId: veh1.id,
      mechanicId: userMechanic2.id,
      status: "READY",
      priority: "NORMAL",
      issueDescription: "Időszakos 180.000 km-es nagyszerviz: olajcsere, összes szűrő, fékfolyadék csere és átvizsgálás.",
      diagnosis: "Minden rendben, fékbetétek 70%-osak, lengéscsillapítók szárazak.",
      publicNotes: "Elvégezve: Castrol Edge 5W-30 LL olajcsere, Mann olaj-, levegő- és aktívszenes pollenszűrő csere, fékfolyadék csere.",
      mileageAtService: 184200,
      fuelLevel: 80,
      trackingToken: "tk_golf_82_ready",
      quoteStatus: "ACCEPTED",
      quoteAcceptedAt: new Date(Date.now() - 86400000 * 2),
      quoteAcceptedBy: "Fekete Tamás",
      laborCostNet: 24000,
      partsCostNet: 38400,
      totalNet: 62400,
      totalVat: 16848,
      totalGross: 79248,
      estimatedHours: 2.0,
      actualHours: 1.8,
      scheduledStart: new Date(Date.now() - 86400000),
      scheduledEnd: new Date(Date.now() - 3600000 * 6),
      completedAt: new Date(Date.now() - 3600000 * 4),
      warrantyPartsMonths: 12,
      warrantyLaborMonths: 6
    }
  });

  // Számla a wo2-höz
  await prisma.invoice.create({
    data: {
      invoiceNumber: "SZ-2026-0142",
      workOrderId: wo2.id,
      customerId: cust1.id,
      type: "INVOICE",
      status: "PAID",
      paymentMethod: "CARD",
      issueDate: new Date(),
      fulfillmentDate: new Date(),
      dueDate: new Date(),
      paidDate: new Date(),
      totalNet: 62400,
      totalVat: 16848,
      totalGross: 79248,
      itemsJson: JSON.stringify([
        { name: "Időszakos karbantartás munkadíj", qty: 1.8, unit: "óra", net: 24000, gross: 30480 },
        { name: "Castrol EDGE 5W-30 LL Motorolaj (4.7L)", qty: 5, unit: "liter", net: 15500, gross: 19685 },
        { name: "MANN Olajszűrő betét", qty: 1, unit: "db", net: 4900, gross: 6223 },
        { name: "MANN Levegőszűrő", qty: 1, unit: "db", net: 6900, gross: 8763 },
        { name: "MANN Aktívszenes pollenszűrő", qty: 1, unit: "db", net: 8900, gross: 11303 },
        { name: "Környezetvédelmi kezelési díj", qty: 1, unit: "db", net: 2200, gross: 2794 }
      ]),
      notes: "Készpénzes/Bankkártyás kiegyenlítés a helyszínen. Köszönjük a bizalmat!"
    }
  });

  // 9. Naptári Időpontok (Appointments)
  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);

  await prisma.appointment.create({
    data: {
      branchId: branchMain.id,
      customerId: cust1.id,
      vehicleId: veh1.id,
      mechanicId: userMechanic2.id,
      bayNumber: 1,
      title: "Golf VII - Kész autó átadása",
      serviceType: "OIL_CHANGE",
      startTime: new Date(today.setHours(16, 30, 0, 0)),
      endTime: new Date(today.setHours(17, 0, 0, 0)),
      status: "CONFIRMED",
      customerNotes: "Ügyfél jön átvenni munka után."
    }
  });

  await prisma.appointment.create({
    data: {
      branchId: branchMain.id,
      customerId: cust3.id,
      vehicleId: veh3.id,
      mechanicId: userMechanic1.id,
      bayNumber: 2,
      title: "Skoda Octavia - 210.000 km vezérléscsere & vízpumpa",
      serviceType: "GENERAL_SERVICE",
      startTime: new Date(tomorrow.setHours(8, 30, 0, 0)),
      endTime: new Date(tomorrow.setHours(13, 0, 0, 0)),
      status: "SCHEDULED",
      customerNotes: "Reggel 8:00-kor behozza a sofőr."
    }
  });

  await prisma.appointment.create({
    data: {
      branchId: branchMain.id,
      bayNumber: 3,
      title: "BMW 320d - Klímatöltés & Ózonos fertőtlenítés",
      serviceType: "AC_SERVICE",
      clientName: "Kiss András",
      clientPhone: "+36 30 999 8877",
      vehiclePlate: "RTL-450",
      startTime: new Date(tomorrow.setHours(14, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(15, 30, 0, 0)),
      status: "SCHEDULED",
      isOnlineBooking: true,
      customerNotes: "Webes online időpontfoglalás."
    }
  });

  // 10. Szervizemlékeztetők (Reminders)
  await prisma.reminder.create({
    data: {
      vehicleId: veh1.id,
      customerId: cust1.id,
      type: "MOT_EXPIRY",
      title: "Műszaki vizsga lejárata (2026.11.15)",
      targetDate: new Date("2026-11-15"),
      status: "PENDING",
      notificationMethod: "BOTH",
      notes: "1 hónappal korábban automatikus SMS és E-mail küldése."
    }
  });

  await prisma.reminder.create({
    data: {
      vehicleId: veh1.id,
      customerId: cust1.id,
      type: "OIL_CHANGE",
      title: "Esedékes olajcsere (195.000 km vagy 2027.09.01)",
      targetMileage: 195000,
      targetDate: new Date("2027-09-01"),
      status: "PENDING",
      notificationMethod: "EMAIL"
    }
  });

  await prisma.reminder.create({
    data: {
      vehicleId: veh2.id,
      customerId: cust2.id,
      type: "MOT_EXPIRY",
      title: "Műszaki vizsga lejárata közeleg!",
      targetDate: new Date("2026-06-20"),
      status: "PENDING",
      notificationMethod: "SMS"
    }
  });

  // 11. Audit Log (Változáskövetés minták)
  await prisma.auditLog.create({
    data: {
      userId: userAdmin.id,
      userName: "Kovács István (Admin)",
      action: "PRICE_CHANGE",
      entityType: "Part",
      entityId: createdParts["BOSCH-0986479098"].id,
      oldValue: "21500 Ft",
      newValue: "23900 Ft",
      description: "BOSCH Féktárcsa eladási ár módosítva az új Unix beszerzési lista alapján."
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: userReception.id,
      userName: "Varga Péter (Munkafelvevő)",
      action: "STATUS_CHANGE",
      entityType: "WorkOrder",
      entityId: wo1.id,
      oldValue: "QUOTE_APPROVED",
      newValue: "IN_PROGRESS",
      description: "ML-2026-0089 munkalap átállítva Javítás alatt státuszra."
    }
  });

  // 12. Rendszerbeállítások (System Settings)
  const systemSettings = [
    { key: "workshop_name", value: "AutoMester Pro Szerviz és Diagnosztika", label: "Műhely Hivatalos Neve", group: "COMPANY" },
    { key: "workshop_phone", value: "+36 1 450 1234", label: "Központi Telefonszám", group: "COMPANY" },
    { key: "workshop_email", value: "szerviz@automesterpro.hu", label: "Központi E-mail cím", group: "COMPANY" },
    { key: "workshop_address", value: "1117 Budapest, Hunyadi János út 16.", label: "Székhely Címe", group: "COMPANY" },
    { key: "default_hourly_rate", value: "15000", label: "Alapértelmezett óradíj (Ft/óra + ÁFA)", group: "FINANCE" },
    { key: "default_vat_rate", value: "27", label: "Alapértelmezett ÁFA kulcs (%)", group: "FINANCE" },
    { key: "currency", value: "HUF", label: "Pénznem", group: "FINANCE" },
    { key: "szamlazz_api_key", value: "MOCK_SZAMLAZZ_KEY_12345", label: "Számlázz.hu API kulcs", group: "INTEGRATION" },
    { key: "billingo_api_key", value: "MOCK_BILLINGO_KEY_67890", label: "Billingo API kulcs", group: "INTEGRATION" },
    { key: "auto_sms_reminders", value: "true", label: "Automatikus SMS értesítések küldése", group: "AUTOMATION" },
    { key: "auto_inventory_deduct", value: "true", label: "Készlet automatikus levonása munkalapra helyezéskor", group: "AUTOMATION" }
  ];

  for (const s of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, label: s.label, group: s.group },
      create: s
    });
  }

  console.log("Seeding finished successfully! AutoMester Pro ERP is ready with full demo database.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
