import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── 1. Users ────────────────────────────────────────────────────────────────
  const adminPass  = await bcrypt.hash("Admin@123", 10);
  const userPass   = await bcrypt.hash("User@123",  10);

  const admin = await prisma.user.upsert({
    where:  { email: "admin@busconnect.com" },
    update: {},
    create: {
      name:            "Super Admin",
      email:           "admin@busconnect.com",
      password:        adminPass,
      role:            Role.ADMIN,
      isEmailVerified: true,
    },
  });

  const user1 = await prisma.user.upsert({
    where:  { email: "joe@example.com" },
    update: {},
    create: {
      name:            "Joe Stephen",
      email:           "joe@example.com",
      password:        userPass,
      role:            Role.USER,
      isEmailVerified: true,
    },
  });

  const user2 = await prisma.user.upsert({
    where:  { email: "alice@example.com" },
    update: {},
    create: {
      name:            "Alice Smith",
      email:           "alice@example.com",
      password:        userPass,
      role:            Role.USER,
      isEmailVerified: true,
    },
  });

  console.log("✅ Users created:");
  console.log(`   👤 Admin  → admin@busconnect.com  / Admin@123`);
  console.log(`   👤 User 1 → joe@example.com       / User@123`);
  console.log(`   👤 User 2 → alice@example.com     / User@123\n`);

  // ── 2. Buses ────────────────────────────────────────────────────────────────
  const buses = await Promise.all([
    prisma.bus.upsert({ where: { id: "bus-seed-001" }, update: {}, create: { id: "bus-seed-001", name: "KL-01-AA-1001", totalSeats: 40 } }),
    prisma.bus.upsert({ where: { id: "bus-seed-002" }, update: {}, create: { id: "bus-seed-002", name: "KL-07-BB-2002", totalSeats: 35 } }),
    prisma.bus.upsert({ where: { id: "bus-seed-003" }, update: {}, create: { id: "bus-seed-003", name: "KL-11-CC-3003", totalSeats: 50 } }),
  ]);

  console.log(`✅ Buses created: ${buses.map(b => b.name).join(", ")}\n`);

  // ── 3. Routes ───────────────────────────────────────────────────────────────
  const routes = await Promise.all([
    prisma.route.upsert({ where: { id: "route-seed-001" }, update: {}, create: { id: "route-seed-001", source: "Kochi",       destination: "Trivandrum",  distance: 214 } }),
    prisma.route.upsert({ where: { id: "route-seed-002" }, update: {}, create: { id: "route-seed-002", source: "Kochi",       destination: "Calicut",     distance: 188 } }),
    prisma.route.upsert({ where: { id: "route-seed-003" }, update: {}, create: { id: "route-seed-003", source: "Trivandrum",  destination: "Thrissur",    distance: 285 } }),
    prisma.route.upsert({ where: { id: "route-seed-004" }, update: {}, create: { id: "route-seed-004", source: "Calicut",     destination: "Kannur",      distance: 92  } }),
  ]);

  console.log(`✅ Routes created: ${routes.map(r => `${r.source} → ${r.destination}`).join(", ")}\n`);

  // ── 4. Schedules (all in the future) ────────────────────────────────────────
  // Base: tomorrow at various times
  const now = new Date();
  const d = (daysAhead: number, hour: number, min: number = 0) => {
    const t = new Date(now);
    t.setDate(t.getDate() + daysAhead);
    t.setHours(hour, min, 0, 0);
    return t;
  };

  const scheduleSeed = [
    // Route 1: Kochi → Trivandrum
    { id: "sched-seed-001", routeId: "route-seed-001", busId: "bus-seed-001", dep: d(1, 6),  arr: d(1, 10), price: 250 },
    { id: "sched-seed-002", routeId: "route-seed-001", busId: "bus-seed-002", dep: d(1, 14), arr: d(1, 18), price: 220 },
    { id: "sched-seed-003", routeId: "route-seed-001", busId: "bus-seed-003", dep: d(2, 7),  arr: d(2, 11), price: 280 },

    // Route 2: Kochi → Calicut
    { id: "sched-seed-004", routeId: "route-seed-002", busId: "bus-seed-001", dep: d(1, 8),  arr: d(1, 12), price: 200 },
    { id: "sched-seed-005", routeId: "route-seed-002", busId: "bus-seed-003", dep: d(1, 16), arr: d(1, 20), price: 195 },

    // Route 3: Trivandrum → Thrissur
    { id: "sched-seed-006", routeId: "route-seed-003", busId: "bus-seed-002", dep: d(1, 5),  arr: d(1, 10, 30), price: 320 },
    { id: "sched-seed-007", routeId: "route-seed-003", busId: "bus-seed-003", dep: d(3, 6),  arr: d(3, 11, 30), price: 310 },

    // Route 4: Calicut → Kannur
    { id: "sched-seed-008", routeId: "route-seed-004", busId: "bus-seed-001", dep: d(1, 9),  arr: d(1, 11), price: 120 },
    { id: "sched-seed-009", routeId: "route-seed-004", busId: "bus-seed-002", dep: d(2, 13), arr: d(2, 15), price: 115 },
  ];

  for (const s of scheduleSeed) {
    await prisma.schedule.upsert({
      where:  { id: s.id },
      update: { departureTime: s.dep, arrivalTime: s.arr, price: s.price },
      create: { id: s.id, routeId: s.routeId, busId: s.busId, departureTime: s.dep, arrivalTime: s.arr, price: s.price },
    });
  }

  console.log(`✅ ${scheduleSeed.length} future-dated schedules created\n`);

  // ── 5. Sample Booking ────────────────────────────────────────────────────────
  await prisma.booking.upsert({
    where:  { id: "booking-seed-001" },
    update: {},
    create: { id: "booking-seed-001", userId: user1.id, scheduleId: "sched-seed-001", status: "BOOKED" },
  });

  console.log(`✅ Sample booking created for joe@example.com on the Kochi → Trivandrum 6 AM slot\n`);
  console.log("🎉 Seeding complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Test Login Credentials:");
  console.log("  Admin  → admin@busconnect.com / Admin@123");
  console.log("  User   → joe@example.com      / User@123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch(e => { console.error("❌ Seed error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
