import { db } from "@/db";
import { getPatientsWithRelations, seedDemoData } from "./actions";
import MedicalDashboard from "./MedicalDashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // 1. Fetch initial patients data from relational database
  let patientsRes = await getPatientsWithRelations();
  
  // 2. If database is completely empty, auto-seed with our realistic B. Medical dataset
  if (patientsRes.success && (!patientsRes.data || patientsRes.data.length === 0)) {
    console.log("Database is empty, auto-seeding B. Medical demonstration dataset...");
    await seedDemoData();
    patientsRes = await getPatientsWithRelations();
  }

  const initialPatients = patientsRes.data || [];

  return (
    <MedicalDashboard initialPatients={initialPatients} />
  );
}
