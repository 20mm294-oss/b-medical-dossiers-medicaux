import { pgTable, serial, text, varchar, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Patients table
export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  gender: varchar('gender', { length: 20 }).notNull(), // 'Masculin', 'Féminin', 'Autre'
  birthDate: varchar('birth_date', { length: 50 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }),
  address: text('address').notNull(),
  bloodGroup: varchar('blood_group', { length: 10 }), // 'A+', 'O-', etc.
  allergies: text('allergies'),
  medicalHistory: text('medical_history'),
  emergencyContactName: varchar('emergency_contact_name', { length: 150 }),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 50 }),
  isPregnant: boolean('is_pregnant').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Consultations table (Linked to Patients)
export const consultations = pgTable('consultations', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  consultationDate: timestamp('consultation_date').defaultNow().notNull(),
  service: varchar('service', { length: 100 }).notNull(), // e.g. 'Médecine Interne', 'Pédiatrie', 'Gynéco-Obstétrique', 'Chirurgie', 'Cardiologie'
  doctorName: varchar('doctor_name', { length: 150 }).notNull(),
  symptoms: text('symptoms').notNull(),
  bloodPressure: varchar('blood_pressure', { length: 30 }), // e.g. '120/80'
  temperature: varchar('temperature', { length: 20 }), // e.g. '37.5 °C'
  weight: varchar('weight', { length: 20 }), // e.g. '70 kg'
  heartRate: varchar('heart_rate', { length: 20 }), // e.g. '78 bpm'
  diagnosis: text('diagnosis').notNull(),
  treatmentPlan: text('treatment_plan'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Prescriptions table (Linked to Patients & optionally Consultations)
export const prescriptions = pgTable('prescriptions', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  consultationId: integer('consultation_id').references(() => consultations.id, { onDelete: 'set null' }),
  prescriptionDate: timestamp('prescription_date').defaultNow().notNull(),
  doctorName: varchar('doctor_name', { length: 150 }).notNull(),
  medicationsJson: text('medications_json').notNull(), // JSON list of drugs: { name, dosage, frequency, duration }
  isFilled: boolean('is_filled').default(false).notNull(), // For Pharmacy track
  requiresDelivery: boolean('requires_delivery').default(false).notNull(), // Delivery to home tracking
  deliveryAddress: text('delivery_address'),
  deliveryStatus: varchar('delivery_status', { length: 50 }).default('En attente'), // 'En attente', 'En cours', 'Livré'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Lab / Ultrasound requests (Laboratoire & Échographie)
export const labRequests = pgTable('lab_requests', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  consultationId: integer('consultation_id').references(() => consultations.id, { onDelete: 'set null' }),
  requestDate: timestamp('request_date').defaultNow().notNull(),
  requestedBy: varchar('requested_by', { length: 150 }).notNull(),
  testType: varchar('test_type', { length: 150 }).notNull(), // e.g., 'Hémogramme', 'Glycémie', 'Échographie Obstétricale'
  category: varchar('category', { length: 50 }).notNull(), // 'Laboratoire' or 'Échographie'
  status: varchar('status', { length: 50 }).default('En attente').notNull(), // 'En attente', 'Réalisé'
  resultDetails: text('result_details'), // The report written by the lab tech / radiologist
  resultDate: timestamp('result_date'),
  labTechnician: varchar('lab_technician', { length: 150 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Appointments table (Rendez-vous)
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  appointmentDate: timestamp('appointment_date').notNull(),
  speciality: varchar('speciality', { length: 100 }).notNull(), // e.g. Cardiologie, Dermatologie, etc.
  doctorName: varchar('doctor_name', { length: 150 }).notNull(),
  reason: text('reason').notNull(),
  status: varchar('status', { length: 50 }).default('Planifié').notNull(), // 'Planifié', 'En cours', 'Terminé', 'Annulé'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Specialized Maternity Tracking (Suivi Maternité/Obstétrique)
export const maternityRecords = pgTable('maternity_records', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  lastMenstrualPeriod: varchar('last_menstrual_period', { length: 50 }), // DDR (Date des Dernières Règles)
  estimatedDeliveryDate: varchar('estimated_delivery_date', { length: 50 }), // DPA (Date Prévue d'Accouchement)
  gravida: integer('gravida').default(0).notNull(), // Nbre de grossesses antérieures
  para: integer('para').default(0).notNull(), // Nbre d'accouchements
  pregnancyNotes: text('pregnancy_notes'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relational connections for Drizzle ORM
export const patientsRelations = relations(patients, ({ many, one }) => ({
  consultations: many(consultations),
  prescriptions: many(prescriptions),
  labRequests: many(labRequests),
  appointments: many(appointments),
  maternityRecord: one(maternityRecords, {
    fields: [patients.id],
    references: [maternityRecords.patientId],
  }),
}));

export const consultationsRelations = relations(consultations, ({ one, many }) => ({
  patient: one(patients, {
    fields: [consultations.patientId],
    references: [patients.id],
  }),
  prescriptions: many(prescriptions),
  labRequests: many(labRequests),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  patient: one(patients, {
    fields: [prescriptions.patientId],
    references: [patients.id],
  }),
  consultation: one(consultations, {
    fields: [prescriptions.consultationId],
    references: [consultations.id],
  }),
}));

export const labRequestsRelations = relations(labRequests, ({ one }) => ({
  patient: one(patients, {
    fields: [labRequests.patientId],
    references: [patients.id],
  }),
  consultation: one(consultations, {
    fields: [labRequests.consultationId],
    references: [consultations.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
}));

export const maternityRecordsRelations = relations(maternityRecords, ({ one }) => ({
  patient: one(patients, {
    fields: [maternityRecords.patientId],
    references: [patients.id],
  }),
}));
