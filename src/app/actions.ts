'use strict';

'use server';

import { db } from '@/db';
import { 
  patients, 
  consultations, 
  prescriptions, 
  labRequests, 
  appointments, 
  maternityRecords 
} from '@/db/schema';
import { eq, desc, and, like, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Interface helpers for prescriptions JSON structure
export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

// ----------------------------------------------------
// SEED DATABASE WITH REALISTIC LUBUMBASHI DATA
// ----------------------------------------------------
export async function seedDemoData() {
  try {
    // 1. Clean existing tables safely
    await db.delete(maternityRecords);
    await db.delete(appointments);
    await db.delete(labRequests);
    await db.delete(prescriptions);
    await db.delete(consultations);
    await db.delete(patients);

    // 2. Insert Patients
    const insertedPatients = await db.insert(patients).values([
      {
        firstName: 'Thérèse',
        lastName: 'Mujinga',
        gender: 'Féminin',
        birthDate: '1995-04-12',
        phone: '+243 81 73 51 858',
        email: 'therese.mujinga@gmail.com',
        address: 'N° 45, Avenue de la Révolution, Lubumbashi',
        bloodGroup: 'O+',
        allergies: 'Pénicilline',
        medicalHistory: 'Asthme léger, première grossesse suivie de près.',
        emergencyContactName: 'Jean Mujinga (Époux)',
        emergencyContactPhone: '+243 99 49 46 021',
        isPregnant: true,
      },
      {
        firstName: 'Junior',
        lastName: 'Kanyinda',
        gender: 'Masculin',
        birthDate: '2019-09-24', // Child
        phone: '+243 84 00 82 917',
        email: 'papa.kanyinda@gmail.com',
        address: 'N° 12, Avenue des Plaines, Q/Bel-air, Lubumbashi',
        bloodGroup: 'A+',
        allergies: 'Aucune connue',
        medicalHistory: 'Vaccinations à jour. Antécédent de bronchiolite à 1 an.',
        emergencyContactName: 'Clara Kanyinda (Mère)',
        emergencyContactPhone: '+243 84 00 82 917',
        isPregnant: false,
      },
      {
        firstName: 'Alphonsine',
        lastName: 'Kabulo',
        gender: 'Féminin',
        birthDate: '1990-11-03',
        phone: '+243 99 12 34 567',
        email: 'alpho.kabulo@yahoo.com',
        address: 'N° 88, Avenue Savonnier, C/Kampemba, Lubumbashi',
        bloodGroup: 'B-',
        allergies: 'Aspirine',
        medicalHistory: 'Hypertension gestationnelle lors de la précédente grossesse.',
        emergencyContactName: 'Albert Kabulo (Frère)',
        emergencyContactPhone: '+243 99 88 77 661',
        isPregnant: true,
      },
      {
        firstName: 'Marc',
        lastName: 'Mwamba',
        gender: 'Masculin',
        birthDate: '1974-06-15',
        phone: '+243 81 22 33 445',
        email: 'marc.mwamba@outlook.com',
        address: 'N° 102, Chaussée de M\'zee Laurent Désiré Kabila, Lubumbashi',
        bloodGroup: 'AB+',
        allergies: 'Sulfamides',
        medicalHistory: 'Diabète de type 2 diagnostiqué en 2021. Suivi en cardiologie.',
        emergencyContactName: 'Marie Mwamba (Épouse)',
        emergencyContactPhone: '+243 81 55 66 777',
        isPregnant: false,
      },
      {
        firstName: 'Florence',
        lastName: 'Ilunga',
        gender: 'Féminin',
        birthDate: '1988-01-20',
        phone: '+243 85 99 00 111',
        email: 'florence.ilunga@gmail.com',
        address: 'N° 14, Avenue Mobutu, Lubumbashi',
        bloodGroup: 'O-',
        allergies: 'Aucune',
        medicalHistory: 'Anémie ferriprive chronique.',
        emergencyContactName: 'Justin Ilunga (Père)',
        emergencyContactPhone: '+243 85 22 33 444',
        isPregnant: false,
      }
    ]).returning();

    const therese = insertedPatients[0];
    const junior = insertedPatients[1];
    const alphonsine = insertedPatients[2];
    const marc = insertedPatients[3];
    const florence = insertedPatients[4];

    // 3. Insert consultations
    const c1 = await db.insert(consultations).values({
      patientId: therese.id,
      service: 'Gynéco-Obstétrique (Maternité)',
      doctorName: 'Dr. Patrick Mwamba',
      symptoms: 'Visite prénatale du 2ème trimestre. Légères nausées matinales résiduelles, fatigue.',
      bloodPressure: '115/75',
      temperature: '36.8 °C',
      weight: '68 kg',
      heartRate: '72 bpm',
      diagnosis: 'Grossesse évolutive de 22 semaines d\'aménorrhée (SA). Paramètres vitaux normaux.',
      treatmentPlan: 'Continuer la supplémentation en Fer et Acide Folique. Hydratation abondante.',
      notes: 'Échographie morphologique demandée pour confirmer le bien-être fœtal.'
    }).returning();

    const c2 = await db.insert(consultations).values({
      patientId: junior.id,
      service: 'Pédiatrie',
      doctorName: 'Dr. Alain Kasongo',
      symptoms: 'Fièvre modérée (38.5°C), toux sèche depuis 2 jours, perte d\'appétit.',
      bloodPressure: '95/60',
      temperature: '38.4 °C',
      weight: '14 kg',
      heartRate: '110 bpm',
      diagnosis: 'Rhinopharyngite aiguë d\'allure virale chez un enfant de 5 ans.',
      treatmentPlan: 'Paracétamol sirop, lavage de nez au sérum physiologique, hydratation continue.',
      notes: 'Surveiller la courbe thermique. Reconsidérer si la fièvre persiste au-delà de 3 jours.'
    }).returning();

    const c3 = await db.insert(consultations).values({
      patientId: marc.id,
      service: 'Médecine Interne',
      doctorName: 'Dr. Jean-Claude Banza',
      symptoms: 'Suivi de glycémie à jeun élevée. Céphalées occasionnelles en fin de journée.',
      bloodPressure: '145/90',
      temperature: '37.1 °C',
      weight: '89 kg',
      heartRate: '82 bpm',
      diagnosis: 'Diabète de type 2 mal équilibré avec pré-hypertension légère.',
      treatmentPlan: 'Ajustement de la posologie de la Metformine. Régime hyposodé et pauvre en sucres rapides.',
      notes: 'Bilan sanguin complet à faire au laboratoire (Glycémie à jeun, HbA1c, Créatininémie).'
    }).returning();

    // 4. Insert prescriptions (some with home delivery!)
    // For Thérèse
    await db.insert(prescriptions).values({
      patientId: therese.id,
      consultationId: c1[0].id,
      doctorName: 'Dr. Patrick Mwamba',
      medicationsJson: JSON.stringify([
        { name: 'Gestarelle Grossesse', dosage: '1 gélule', frequency: '1x par jour le matin', duration: '3 mois' },
        { name: 'Tardyferon B9', dosage: '50mg', frequency: '1 comprimé par jour', duration: '30 jours' }
      ]),
      isFilled: true,
      requiresDelivery: false,
    });

    // For Junior Kanyinda - requires home delivery (Livraison à domicile)
    await db.insert(prescriptions).values({
      patientId: junior.id,
      consultationId: c2[0].id,
      doctorName: 'Dr. Alain Kasongo',
      medicationsJson: JSON.stringify([
        { name: 'Paracétamol Sirop 150mg', dosage: '1 mesurette', frequency: 'Toutes les 6h si fièvre', duration: '5 jours' },
        { name: 'Physiomer Spray', dosage: '1 pulvérisation', frequency: '3x par jour par narine', duration: '7 jours' }
      ]),
      isFilled: false,
      requiresDelivery: true,
      deliveryAddress: 'N° 12, Avenue des Plaines, Q/Bel-air, Lubumbashi (Livraison Urgente)',
      deliveryStatus: 'En attente',
    });

    // For Marc Mwamba - requires home delivery (Livraison à domicile)
    await db.insert(prescriptions).values({
      patientId: marc.id,
      consultationId: c3[0].id,
      doctorName: 'Dr. Jean-Claude Banza',
      medicationsJson: JSON.stringify([
        { name: 'Metformine 1000mg', dosage: '1 comprimé', frequency: '2x par jour au repas', duration: '3 mois' },
        { name: 'Amlodipine 5mg', dosage: '1 comprimé', frequency: '1x par jour le matin', duration: '3 mois' }
      ]),
      isFilled: true,
      requiresDelivery: true,
      deliveryAddress: 'N° 102, Chaussée de M\'zee Laurent Désiré Kabila, Lubumbashi',
      deliveryStatus: 'En cours',
    });

    // 5. Insert lab & ultrasound requests
    // Test for Thérèse (Echographie)
    await db.insert(labRequests).values({
      patientId: therese.id,
      consultationId: c1[0].id,
      requestedBy: 'Dr. Patrick Mwamba',
      testType: 'Échographie Morphologique du 2ème Trimestre',
      category: 'Échographie',
      status: 'Réalisé',
      resultDetails: 'Examen échographique montrant une grossesse monofœtale active. Biométries fœtales en accord avec le terme de 22 SA. Activité cardiaque fœtale bien perçue (145 bpm). Absence d\'anomalie morphologique décelable ce jour. Placenta antérieur haut inséré.',
      resultDate: new Date(),
      labTechnician: 'Mme. Sarah Kabulo'
    });

    // Blood test for Marc (Laboratoire)
    await db.insert(labRequests).values({
      patientId: marc.id,
      consultationId: c3[0].id,
      requestedBy: 'Dr. Jean-Claude Banza',
      testType: 'Glycémie à jeun & Hémoglobine Glyquée (HbA1c)',
      category: 'Laboratoire',
      status: 'En attente',
    });

    // Echo for Alphonsine (Echographie)
    await db.insert(labRequests).values({
      patientId: alphonsine.id,
      requestedBy: 'Dr. Patrick Mwamba',
      testType: 'Échographie Obstétricale de Datation',
      category: 'Échographie',
      status: 'En attente',
    });

    // 6. Insert maternity records for pregnant patients
    await db.insert(maternityRecords).values({
      patientId: therese.id,
      lastMenstrualPeriod: '2025-10-10',
      estimatedDeliveryDate: '2026-07-17',
      gravida: 1,
      para: 0,
      pregnancyNotes: 'Grossesse initiale de déroulement normal. Patiente coopérative et ponctuelle aux rendez-vous.',
    });

    await db.insert(maternityRecords).values({
      patientId: alphonsine.id,
      lastMenstrualPeriod: '2025-11-20',
      estimatedDeliveryDate: '2026-08-27',
      gravida: 3,
      para: 2,
      pregnancyNotes: 'Antécédent de pré-éclampsie lors du 2ème accouchement. Surveillance stricte de la tension artérielle à domicile et lors des consultations.',
    });

    // 7. Insert appointments
    await db.insert(appointments).values([
      {
        patientId: marc.id,
        appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
        speciality: 'Cardiologie',
        doctorName: 'Dr. Michel Katenga',
        reason: 'Contrôle tensionnel annuel et électrocardiogramme suite au suivi diabétique.',
        status: 'Planifié',
      },
      {
        patientId: therese.id,
        appointmentDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // in 14 days
        speciality: 'Gynéco-Obstétrique',
        doctorName: 'Dr. Patrick Mwamba',
        reason: 'Consultation prénatale du 6ème mois.',
        status: 'Planifié',
      },
      {
        patientId: florence.id,
        appointmentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
        speciality: 'Dermatologie',
        doctorName: 'Dr. Sandrine Ngoie',
        reason: 'Prurit diffus avec lésions d\'eczéma atopique sur les membres.',
        status: 'Terminé',
      },
      {
        patientId: junior.id,
        appointmentDate: new Date(), // Today
        speciality: 'Chirurgie Pédiatrique',
        doctorName: 'Dr. Augustin Ilunga',
        reason: 'Évaluation d\'une hernie inguinale bénigne chez l\'enfant.',
        status: 'Planifié',
      }
    ]);

    revalidatePath('/');
    return { success: true, message: 'La base de données de B. Medical a été réinitialisée avec succès avec des données de démonstration réalistes.' };
  } catch (err: any) {
    console.error('Error seeding data:', err);
    return { success: false, error: err.message || String(err) };
  }
}

// ----------------------------------------------------
// PATIENTS ACTIONS
// ----------------------------------------------------
export async function getPatientsWithRelations() {
  try {
    const list = await db.query.patients.findMany({
      with: {
        consultations: {
          orderBy: [desc(consultations.consultationDate)],
        },
        prescriptions: {
          orderBy: [desc(prescriptions.prescriptionDate)],
        },
        labRequests: {
          orderBy: [desc(labRequests.requestDate)],
        },
        appointments: {
          orderBy: [desc(appointments.appointmentDate)],
        },
        maternityRecord: true,
      },
      orderBy: [desc(patients.createdAt)],
    });
    return { success: true, data: list };
  } catch (err: any) {
    console.error('Error getting patients:', err);
    return { success: false, error: err.message, data: [] };
  }
}

export async function createPatient(formData: {
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  phone: string;
  email?: string;
  address: string;
  bloodGroup?: string;
  allergies?: string;
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  isPregnant?: boolean;
  // Optional initial pregnancy details
  lastMenstrualPeriod?: string;
  estimatedDeliveryDate?: string;
  gravida?: number;
  para?: number;
}) {
  try {
    const result = await db.insert(patients).values({
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender,
      birthDate: formData.birthDate,
      phone: formData.phone,
      email: formData.email || null,
      address: formData.address,
      bloodGroup: formData.bloodGroup || null,
      allergies: formData.allergies || null,
      medicalHistory: formData.medicalHistory || null,
      emergencyContactName: formData.emergencyContactName || null,
      emergencyContactPhone: formData.emergencyContactPhone || null,
      isPregnant: formData.gender === 'Féminin' ? (formData.isPregnant || false) : false,
    }).returning();

    const newPatient = result[0];

    // If female and marked pregnant, create pregnancy follow-up record too
    if (newPatient.gender === 'Féminin' && newPatient.isPregnant) {
      await db.insert(maternityRecords).values({
        patientId: newPatient.id,
        lastMenstrualPeriod: formData.lastMenstrualPeriod || '',
        estimatedDeliveryDate: formData.estimatedDeliveryDate || '',
        gravida: formData.gravida || 1,
        para: formData.para || 0,
        pregnancyNotes: 'Nouveau dossier de suivi de grossesse créé.',
      });
    }

    revalidatePath('/');
    return { success: true, data: newPatient };
  } catch (err: any) {
    console.error('Error creating patient:', err);
    return { success: false, error: err.message };
  }
}

export async function deletePatient(patientId: number) {
  try {
    await db.delete(patients).where(eq(patients.id, patientId));
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Error deleting patient:', err);
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// CONSULTATIONS ACTIONS (linked to prescriptions & labs)
// ----------------------------------------------------
export async function createConsultation(data: {
  patientId: number;
  service: string;
  doctorName: string;
  symptoms: string;
  bloodPressure?: string;
  temperature?: string;
  weight?: string;
  heartRate?: string;
  diagnosis: string;
  treatmentPlan?: string;
  notes?: string;
  // Optional prescription details
  addPrescription?: boolean;
  medications?: Medication[];
  requiresDelivery?: boolean;
  deliveryAddress?: string;
  // Optional lab request details
  addLabRequest?: boolean;
  testType?: string;
  category?: 'Laboratoire' | 'Échographie';
}) {
  try {
    const result = await db.insert(consultations).values({
      patientId: data.patientId,
      service: data.service,
      doctorName: data.doctorName,
      symptoms: data.symptoms,
      bloodPressure: data.bloodPressure || null,
      temperature: data.temperature || null,
      weight: data.weight || null,
      heartRate: data.heartRate || null,
      diagnosis: data.diagnosis,
      treatmentPlan: data.treatmentPlan || null,
      notes: data.notes || null,
    }).returning();

    const newConsultation = result[0];

    // Add prescription if checked and medications exist
    if (data.addPrescription && data.medications && data.medications.length > 0) {
      await db.insert(prescriptions).values({
        patientId: data.patientId,
        consultationId: newConsultation.id,
        doctorName: data.doctorName,
        medicationsJson: JSON.stringify(data.medications),
        isFilled: false,
        requiresDelivery: data.requiresDelivery || false,
        deliveryAddress: data.requiresDelivery ? (data.deliveryAddress || '') : null,
        deliveryStatus: data.requiresDelivery ? 'En attente' : null,
      });
    }

    // Add laboratory / ultrasound request if requested
    if (data.addLabRequest && data.testType && data.category) {
      await db.insert(labRequests).values({
        patientId: data.patientId,
        consultationId: newConsultation.id,
        requestedBy: data.doctorName,
        testType: data.testType,
        category: data.category,
        status: 'En attente',
      });
    }

    revalidatePath('/');
    return { success: true, data: newConsultation };
  } catch (err: any) {
    console.error('Error creating consultation:', err);
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// PHARMACY / PRESCRIPTIONS ACTIONS
// ----------------------------------------------------
export async function getPrescriptions() {
  try {
    const list = await db.query.prescriptions.findMany({
      with: {
        patient: true,
      },
      orderBy: [desc(prescriptions.prescriptionDate)],
    });
    return { success: true, data: list };
  } catch (err: any) {
    console.error('Error fetching prescriptions:', err);
    return { success: false, error: err.message, data: [] };
  }
}

export async function updatePrescriptionStatus(prescriptionId: number, update: {
  isFilled?: boolean;
  deliveryStatus?: 'En attente' | 'En cours' | 'Livré';
}) {
  try {
    await db.update(prescriptions)
      .set(update)
      .where(eq(prescriptions.id, prescriptionId));
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Error updating prescription status:', err);
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// LABORATORY & ULTRASOUND ACTIONS
// ----------------------------------------------------
export async function getLabRequests() {
  try {
    const list = await db.query.labRequests.findMany({
      with: {
        patient: true,
      },
      orderBy: [desc(labRequests.requestDate)],
    });
    return { success: true, data: list };
  } catch (err: any) {
    console.error('Error fetching lab requests:', err);
    return { success: false, error: err.message, data: [] };
  }
}

export async function submitLabResults(requestId: number, data: {
  resultDetails: string;
  labTechnician: string;
}) {
  try {
    await db.update(labRequests)
      .set({
        resultDetails: data.resultDetails,
        labTechnician: data.labTechnician,
        status: 'Réalisé',
        resultDate: new Date(),
      })
      .where(eq(labRequests.id, requestId));
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Error submitting lab results:', err);
    return { success: false, error: err.message };
  }
}

export async function addDirectLabRequest(data: {
  patientId: number;
  requestedBy: string;
  testType: string;
  category: 'Laboratoire' | 'Échographie';
}) {
  try {
    await db.insert(labRequests).values({
      patientId: data.patientId,
      requestedBy: data.requestedBy,
      testType: data.testType,
      category: data.category,
      status: 'En attente',
    });
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Error creating lab request:', err);
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// APPOINTMENTS ACTIONS
// ----------------------------------------------------
export async function getAppointments() {
  try {
    const list = await db.query.appointments.findMany({
      with: {
        patient: true,
      },
      orderBy: [desc(appointments.appointmentDate)],
    });
    return { success: true, data: list };
  } catch (err: any) {
    console.error('Error fetching appointments:', err);
    return { success: false, error: err.message, data: [] };
  }
}

export async function createAppointment(data: {
  patientId: number;
  appointmentDate: string; // ISO string
  speciality: string;
  doctorName: string;
  reason: string;
}) {
  try {
    await db.insert(appointments).values({
      patientId: data.patientId,
      appointmentDate: new Date(data.appointmentDate),
      speciality: data.speciality,
      doctorName: data.doctorName,
      reason: data.reason,
      status: 'Planifié',
    });
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Error creating appointment:', err);
    return { success: false, error: err.message };
  }
}

export async function updateAppointmentStatus(appointmentId: number, status: 'Planifié' | 'En cours' | 'Terminé' | 'Annulé') {
  try {
    await db.update(appointments)
      .set({ status })
      .where(eq(appointments.id, appointmentId));
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Error updating appointment:', err);
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// MATERNITY FOLLOWUP ACTIONS
// ----------------------------------------------------
export async function updateMaternityRecord(data: {
  patientId: number;
  lastMenstrualPeriod: string;
  estimatedDeliveryDate: string;
  gravida: number;
  para: number;
  pregnancyNotes: string;
}) {
  try {
    // Check if record exists
    const record = await db.query.maternityRecords.findFirst({
      where: eq(maternityRecords.patientId, data.patientId),
    });

    if (record) {
      await db.update(maternityRecords)
        .set({
          lastMenstrualPeriod: data.lastMenstrualPeriod,
          estimatedDeliveryDate: data.estimatedDeliveryDate,
          gravida: data.gravida,
          para: data.para,
          pregnancyNotes: data.pregnancyNotes,
          updatedAt: new Date(),
        })
        .where(eq(maternityRecords.patientId, data.patientId));
    } else {
      await db.insert(maternityRecords).values({
        patientId: data.patientId,
        lastMenstrualPeriod: data.lastMenstrualPeriod,
        estimatedDeliveryDate: data.estimatedDeliveryDate,
        gravida: data.gravida,
        para: data.para,
        pregnancyNotes: data.pregnancyNotes,
      });
    }

    // Ensure the patient is marked as pregnant in patients table too!
    await db.update(patients)
      .set({ isPregnant: true })
      .where(eq(patients.id, data.patientId));

    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Error updating maternity record:', err);
    return { success: false, error: err.message };
  }
}

export async function updatePregnancyStatus(patientId: number, isPregnant: boolean) {
  try {
    await db.update(patients)
      .set({ isPregnant })
      .where(eq(patients.id, patientId));

    if (!isPregnant) {
      // Safely delete maternity record
      await db.delete(maternityRecords).where(eq(maternityRecords.patientId, patientId));
    } else {
      // Create empty maternity record if it doesn't exist
      const existing = await db.query.maternityRecords.findFirst({
        where: eq(maternityRecords.patientId, patientId),
      });
      if (!existing) {
        await db.insert(maternityRecords).values({
          patientId,
          lastMenstrualPeriod: '',
          estimatedDeliveryDate: '',
          gravida: 1,
          para: 0,
          pregnancyNotes: 'Dossier prénatal activé.',
        });
      }
    }

    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Error updating pregnancy status:', err);
    return { success: false, error: err.message };
  }
}
