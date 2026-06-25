'use client';

import React, { useState, useTransition } from 'react';
import { 
  Users, 
  Stethoscope, 
  Baby, 
  FileText, 
  Pill, 
  FileSpreadsheet, 
  Calendar, 
  Search, 
  Plus, 
  Check, 
  X, 
  Clock, 
  Truck, 
  Activity, 
  Smartphone, 
  MapPin, 
  Mail, 
  Info, 
  RefreshCw, 
  Briefcase, 
  Heart, 
  FileDigit,
  ShieldAlert,
  Beaker,
  Compass,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { 
  seedDemoData, 
  createPatient, 
  createConsultation, 
  updatePrescriptionStatus, 
  submitLabResults, 
  createAppointment, 
  updateAppointmentStatus, 
  updateMaternityRecord, 
  updatePregnancyStatus,
  deletePatient,
  Medication
} from './actions';

interface MedicalDashboardProps {
  initialPatients: any[];
}

export default function MedicalDashboard({ initialPatients }: MedicalDashboardProps) {
  const [patientsList, setPatientsList] = useState<any[]>(initialPatients);
  const [isPending, startTransition] = useTransition();

  // Active role for the simulation
  const [activeRole, setActiveRole] = useState<'doctor' | 'pharmacist' | 'lab_tech' | 'receptionist'>('doctor');
  const [activeStaffName, setActiveStaffName] = useState('Dr. Patrick Mwamba (Gynécologue)');

  // Main navigation tabs
  const [activeTab, setActiveTab] = useState<'patients' | 'consultation' | 'maternity' | 'pharmacy' | 'lab' | 'appointments' | 'about'>('patients');

  // Selected patient for medical record detail view
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    initialPatients.length > 0 ? initialPatients[0].id : null
  );

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('Tous');
  const [pregnantOnlyFilter, setPregnantOnlyFilter] = useState(false);

  // Form states
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Féminin',
    birthDate: '',
    phone: '',
    email: '',
    address: '',
    bloodGroup: 'O+',
    allergies: '',
    medicalHistory: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    isPregnant: false,
    lastMenstrualPeriod: '',
    estimatedDeliveryDate: '',
    gravida: 1,
    para: 0
  });

  // Consultation Form state
  const [selectedConsultationPatientId, setSelectedConsultationPatientId] = useState<string>('');
  const [consultationService, setConsultationService] = useState('Gynéco-Obstétrique (Maternité)');
  const [consultationDoctor, setConsultationDoctor] = useState('Dr. Patrick Mwamba');
  const [symptoms, setSymptoms] = useState('');
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [temperature, setTemperature] = useState('37.0');
  const [weight, setWeight] = useState('70');
  const [heartRate, setHeartRate] = useState('75');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [consultationNotes, setConsultationNotes] = useState('');

  // Embedded prescription state
  const [addPrescription, setAddPrescription] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([
    { name: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [requiresDelivery, setRequiresDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Embedded lab request state
  const [addLabRequest, setAddLabRequest] = useState(false);
  const [labTestType, setLabTestType] = useState('Échographie Morphologique du 2ème Trimestre');
  const [labCategory, setLabCategory] = useState<'Laboratoire' | 'Échographie'>('Échographie');

  // Lab Result Form state
  const [selectedLabRequestId, setSelectedLabRequestId] = useState<number | null>(null);
  const [labResultText, setLabResultText] = useState('');
  const [labTechnicianName, setLabTechnicianName] = useState('Mme. Sarah Kabulo');

  // Appointment Form state
  const [apptPatientId, setApptPatientId] = useState<string>('');
  const [apptDate, setApptDate] = useState('');
  const [apptSpeciality, setApptSpeciality] = useState('Cardiologie');
  const [apptDoctor, setApptDoctor] = useState('');
  const [apptReason, setApptReason] = useState('');

  // Maternity Update state
  const [editingMaternityPatientId, setEditingMaternityPatientId] = useState<number | null>(null);
  const [maternityForm, setMaternityForm] = useState({
    lastMenstrualPeriod: '',
    estimatedDeliveryDate: '',
    gravida: 1,
    para: 0,
    pregnancyNotes: ''
  });

  // Notification Banner
  const [notification, setNotification] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleRoleChange = (role: 'doctor' | 'pharmacist' | 'lab_tech' | 'receptionist') => {
    setActiveRole(role);
    if (role === 'doctor') {
      setActiveStaffName('Dr. Patrick Mwamba (Gynécologue)');
      setConsultationDoctor('Dr. Patrick Mwamba');
      setConsultationService('Gynéco-Obstétrique (Maternité)');
    } else if (role === 'pharmacist') {
      setActiveStaffName('Mme. Julie Mutombo (Pharmacienne)');
    } else if (role === 'lab_tech') {
      setActiveStaffName('Mme. Sarah Kabulo (Biologiste/Radio)');
      setLabTechnicianName('Mme. Sarah Kabulo');
    } else if (role === 'receptionist') {
      setActiveStaffName('Mr. Guy Ilunga (Réceptionniste)');
    }
  };

  // ----------------------------------------------------
  // SERVER ACTIONS WRAPPERS
  // ----------------------------------------------------
  const refreshData = async () => {
    const res = await fetch('/api/patients-list');
    if (res.ok) {
      const result = await res.json();
      if (result.success) {
        setPatientsList(result.data);
        if (result.data.length > 0 && !selectedPatientId) {
          setSelectedPatientId(result.data[0].id);
        }
      }
    }
  };

  const handleSeed = () => {
    startTransition(async () => {
      const res = await seedDemoData();
      if (res.success) {
        showNotification(res.message || 'Données réinitialisées !');
        await refreshData();
      } else {
        showNotification(res.error || 'Erreur lors du seed', 'error');
      }
    });
  };

  const handleAddPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientData.firstName || !newPatientData.lastName || !newPatientData.birthDate || !newPatientData.phone || !newPatientData.address) {
      showNotification('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    startTransition(async () => {
      const res = await createPatient({
        firstName: newPatientData.firstName,
        lastName: newPatientData.lastName,
        gender: newPatientData.gender,
        birthDate: newPatientData.birthDate,
        phone: newPatientData.phone,
        email: newPatientData.email,
        address: newPatientData.address,
        bloodGroup: newPatientData.bloodGroup,
        allergies: newPatientData.allergies,
        medicalHistory: newPatientData.medicalHistory,
        emergencyContactName: newPatientData.emergencyContactName,
        emergencyContactPhone: newPatientData.emergencyContactPhone,
        isPregnant: newPatientData.isPregnant,
        lastMenstrualPeriod: newPatientData.lastMenstrualPeriod,
        estimatedDeliveryDate: newPatientData.estimatedDeliveryDate,
        gravida: Number(newPatientData.gravida),
        para: Number(newPatientData.para)
      });

      if (res.success) {
        showNotification(`Le patient ${newPatientData.firstName} ${newPatientData.lastName} a été enregistré.`);
        setShowAddPatientModal(false);
        // Reset form
        setNewPatientData({
          firstName: '',
          lastName: '',
          gender: 'Féminin',
          birthDate: '',
          phone: '',
          email: '',
          address: '',
          bloodGroup: 'O+',
          allergies: '',
          medicalHistory: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          isPregnant: false,
          lastMenstrualPeriod: '',
          estimatedDeliveryDate: '',
          gravida: 1,
          para: 0
        });
        await refreshData();
      } else {
        showNotification(`Erreur: ${res.error}`, 'error');
      }
    });
  };

  const handleDeletePatient = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce patient et l\'intégralité de son dossier médical ?')) {
      return;
    }
    startTransition(async () => {
      const res = await deletePatient(id);
      if (res.success) {
        showNotification('Patient supprimé avec succès.');
        if (selectedPatientId === id) {
          setSelectedPatientId(null);
        }
        await refreshData();
      } else {
        showNotification(res.error || 'Erreur lors de la suppression', 'error');
      }
    });
  };

  const handleAddConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultationPatientId) {
      showNotification('Veuillez sélectionner un patient.', 'error');
      return;
    }
    if (!symptoms || !diagnosis) {
      showNotification('Veuillez saisir les symptômes et le diagnostic.', 'error');
      return;
    }

    // Filter out empty medications if prescription is checked
    const cleanMeds = medications.filter(m => m.name.trim() !== '');
    if (addPrescription && cleanMeds.length === 0) {
      showNotification('Veuillez ajouter au moins un médicament à l\'ordonnance.', 'error');
      return;
    }

    startTransition(async () => {
      const res = await createConsultation({
        patientId: Number(selectedConsultationPatientId),
        service: consultationService,
        doctorName: consultationDoctor,
        symptoms,
        bloodPressure,
        temperature,
        weight,
        heartRate,
        diagnosis,
        treatmentPlan,
        notes: consultationNotes,
        addPrescription,
        medications: cleanMeds,
        requiresDelivery,
        deliveryAddress: requiresDelivery ? deliveryAddress : undefined,
        addLabRequest,
        testType: labTestType,
        category: labCategory
      });

      if (res.success) {
        showNotification('Consultation et dossiers associés enregistrés avec succès !');
        // Reset state
        setSymptoms('');
        setDiagnosis('');
        setTreatmentPlan('');
        setConsultationNotes('');
        setAddPrescription(false);
        setMedications([{ name: '', dosage: '', frequency: '', duration: '' }]);
        setRequiresDelivery(false);
        setDeliveryAddress('');
        setAddLabRequest(false);
        setSelectedConsultationPatientId('');
        setActiveTab('patients');
        if (selectedConsultationPatientId) {
          setSelectedPatientId(Number(selectedConsultationPatientId));
        }
        await refreshData();
      } else {
        showNotification(res.error || 'Erreur', 'error');
      }
    });
  };

  const handleUpdatePrescription = async (prescId: number, filled: boolean, delivStatus?: 'En attente' | 'En cours' | 'Livré') => {
    startTransition(async () => {
      const res = await updatePrescriptionStatus(prescId, {
        isFilled: filled,
        deliveryStatus: delivStatus
      });
      if (res.success) {
        showNotification('Statut de la prescription mis à jour avec succès.');
        await refreshData();
      } else {
        showNotification(res.error || 'Erreur de mise à jour', 'error');
      }
    });
  };

  const handleSaveLabResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLabRequestId === null || !labResultText) {
      showNotification('Veuillez saisir les résultats de l\'examen.', 'error');
      return;
    }

    startTransition(async () => {
      const res = await submitLabResults(selectedLabRequestId, {
        resultDetails: labResultText,
        labTechnician: labTechnicianName
      });
      if (res.success) {
        showNotification('Résultats enregistrés et intégrés au dossier patient !');
        setSelectedLabRequestId(null);
        setLabResultText('');
        await refreshData();
      } else {
        showNotification(res.error || 'Erreur', 'error');
      }
    });
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptPatientId || !apptDate || !apptReason || !apptDoctor) {
      showNotification('Veuillez remplir tous les champs du rendez-vous.', 'error');
      return;
    }

    startTransition(async () => {
      const res = await createAppointment({
        patientId: Number(apptPatientId),
        appointmentDate: apptDate,
        speciality: apptSpeciality,
        doctorName: apptDoctor,
        reason: apptReason
      });

      if (res.success) {
        showNotification('Rendez-vous planifié avec succès.');
        setApptPatientId('');
        setApptDate('');
        setApptReason('');
        setApptDoctor('');
        await refreshData();
      } else {
        showNotification(res.error || 'Erreur', 'error');
      }
    });
  };

  const handleUpdateAppointment = async (apptId: number, status: 'Planifié' | 'En cours' | 'Terminé' | 'Annulé') => {
    startTransition(async () => {
      const res = await updateAppointmentStatus(apptId, status);
      if (res.success) {
        showNotification(`Rendez-vous mis à jour: ${status}`);
        await refreshData();
      } else {
        showNotification(res.error || 'Erreur', 'error');
      }
    });
  };

  const handleSaveMaternityRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMaternityPatientId === null) return;

    startTransition(async () => {
      const res = await updateMaternityRecord({
        patientId: editingMaternityPatientId,
        lastMenstrualPeriod: maternityForm.lastMenstrualPeriod,
        estimatedDeliveryDate: maternityForm.estimatedDeliveryDate,
        gravida: Number(maternityForm.gravida),
        para: Number(maternityForm.para),
        pregnancyNotes: maternityForm.pregnancyNotes
      });

      if (res.success) {
        showNotification('Dossier de suivi de grossesse mis à jour avec succès.');
        setEditingMaternityPatientId(null);
        await refreshData();
      } else {
        showNotification(res.error || 'Erreur de mise à jour', 'error');
      }
    });
  };

  const handleTogglePregnancyStatus = async (patientId: number, isPregnant: boolean) => {
    startTransition(async () => {
      const res = await updatePregnancyStatus(patientId, isPregnant);
      if (res.success) {
        showNotification(isPregnant ? 'Statut de grossesse activé. Dossier de suivi prénatal créé.' : 'Statut de grossesse désactivé.');
        await refreshData();
      } else {
        showNotification(res.error || 'Erreur', 'error');
      }
    });
  };

  // ----------------------------------------------------
  // CLIENT FILTERING LOGIC
  // ----------------------------------------------------
  const filteredPatients = patientsList.filter(p => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = fullName.includes(searchLower) || 
                          p.phone.includes(searchLower) || 
                          (p.bloodGroup && p.bloodGroup.toLowerCase().includes(searchLower)) ||
                          p.address.toLowerCase().includes(searchLower);

    const matchesGender = genderFilter === 'Tous' || p.gender === genderFilter;
    const matchesPregnant = !pregnantOnlyFilter || p.isPregnant;

    return matchesSearch && matchesGender && matchesPregnant;
  });

  const selectedPatient = patientsList.find(p => p.id === selectedPatientId);

  // Extract medical stats for counter badges
  const stats = {
    totalPatients: patientsList.length,
    pregnantCount: patientsList.filter(p => p.isPregnant).length,
    pendingDeliveries: patientsList.reduce((acc, p) => 
      acc + p.prescriptions.filter((pr: any) => pr.requiresDelivery && pr.deliveryStatus !== 'Livré').length, 0
    ),
    pendingLabs: patientsList.reduce((acc, p) => 
      acc + p.labRequests.filter((l: any) => l.status === 'En attente').length, 0
    ),
    scheduledAppts: patientsList.reduce((acc, p) => 
      acc + p.appointments.filter((a: any) => a.status === 'Planifié').length, 0
    ),
  };

  // Helper for rendering role banner background
  const getRoleTheme = () => {
    switch(activeRole) {
      case 'doctor': return { bg: 'bg-teal-700 text-white', accent: 'bg-teal-550 border-teal-600', ring: 'ring-teal-500' };
      case 'pharmacist': return { bg: 'bg-indigo-700 text-white', accent: 'bg-indigo-550 border-indigo-600', ring: 'ring-indigo-500' };
      case 'lab_tech': return { bg: 'bg-emerald-700 text-white', accent: 'bg-emerald-550 border-emerald-600', ring: 'ring-emerald-500' };
      case 'receptionist': return { bg: 'bg-cyan-700 text-white', accent: 'bg-cyan-550 border-cyan-600', ring: 'ring-cyan-500' };
    }
  };

  const roleTheme = getRoleTheme();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* ----------------- NOTIFICATION BANNER ----------------- */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center space-x-3 transition-all transform duration-300 max-w-md ${
          notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          {notification.type === 'success' ? <Check className="h-6 w-6 shrink-0" /> : <ShieldAlert className="h-6 w-6 shrink-0" />}
          <div>
            <p className="font-semibold text-sm">{notification.text}</p>
          </div>
          <button onClick={() => setNotification(null)} className="hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ----------------- BRANDING HEADER (B. Medical) ----------------- */}
      <header className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white border-b-4 border-lime-400 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Logo and Slogan */}
            <div className="flex items-start space-x-4">
              <div className="bg-white p-2.5 rounded-2xl shadow-md border-2 border-lime-400 flex items-center justify-center shrink-0">
                <div className="relative flex items-center justify-center">
                  {/* Styled B. Medical cross logo concept */}
                  <span className="text-teal-900 font-extrabold text-3xl tracking-tight leading-none">B</span>
                  <span className="text-lime-500 font-black text-3xl leading-none">.</span>
                  <div className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-bold px-1 rounded flex items-center justify-center">
                    +
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-black tracking-wider text-lime-400">B. Medical</span>
                  <span className="text-xs bg-lime-500/20 text-lime-300 px-2 py-0.5 rounded-full border border-lime-500/30 font-medium">
                    Lubumbashi, RDC
                  </span>
                </div>
                <p className="text-xs text-teal-200 tracking-wide mt-0.5 italic font-medium">"Hope for well-being — L'espoir du bien-être"</p>
                <p className="text-[10px] text-slate-300 font-light mt-0.5">N° 123, Avenue Savonnier, Q/Bel-air, C/Kampemba</p>
              </div>
            </div>

            {/* Quick action: Re-seed demo data & Simulator Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={handleSeed}
                disabled={isPending}
                className="bg-lime-500 hover:bg-lime-400 disabled:bg-slate-700 text-slate-900 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition duration-150 cursor-pointer shadow-sm"
                title="Régénérer des dossiers médicaux complets de test (Re-seed)"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} />
                <span>Réinitialiser Démo</span>
              </button>

              <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700 flex items-center space-x-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 hidden lg:inline">
                  Mode Simulation :
                </span>
                
                <button
                  onClick={() => handleRoleChange('doctor')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
                    activeRole === 'doctor' ? 'bg-teal-600 text-white font-bold shadow' : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Stethoscope className="h-3 w-3" />
                  <span>Médecin</span>
                </button>
                
                <button
                  onClick={() => handleRoleChange('receptionist')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
                    activeRole === 'receptionist' ? 'bg-cyan-600 text-white font-bold shadow' : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Users className="h-3 w-3" />
                  <span>Réception</span>
                </button>

                <button
                  onClick={() => handleRoleChange('pharmacist')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
                    activeRole === 'pharmacist' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Pill className="h-3 w-3" />
                  <span>Pharmacie</span>
                </button>

                <button
                  onClick={() => handleRoleChange('lab_tech')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
                    activeRole === 'lab_tech' ? 'bg-emerald-600 text-white font-bold shadow' : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Beaker className="h-3 w-3" />
                  <span>Lab/Écho</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ----------------- ACTIVE PERSONA BAR ----------------- */}
      <div className={`py-2 px-4 shadow-inner text-xs flex justify-between items-center transition-colors duration-250 ${roleTheme?.bg}`}>
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5">
          <div className="flex items-center space-x-2 font-medium">
            <span className="font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded text-[10px]">
              Session Active :
            </span>
            <span className="font-bold underline decoration-lime-300 decoration-2">{activeStaffName}</span>
          </div>
          <div className="text-white/80 italic text-[11px]">
            {activeRole === 'doctor' && "💡 Vous pouvez rédiger des consultations, ordonnances, et prescrire des examens."}
            {activeRole === 'receptionist' && "💡 Vous pouvez inscrire de nouveaux patients et planifier des rendez-vous par spécialité."}
            {activeRole === 'pharmacist' && "💡 Vous gérez la dispensation des ordonnances et préparez les livraisons à domicile."}
            {activeRole === 'lab_tech' && "💡 Vous effectuez les examens biologiques et rédigez les rapports d'échographies."}
          </div>
        </div>
      </div>

      {/* ----------------- KPI DASHBOARD METRICS ----------------- */}
      <section className="bg-white border-b border-slate-200 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            
            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-teal-100 text-teal-700 shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">Patients</p>
                <p className="text-xl font-extrabold text-slate-900">{stats.totalPatients}</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-lime-100 text-lime-700 shrink-0">
                <Baby className="h-5 w-5" />
              </div>
              <div>
                <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">Suivi Maternité</p>
                <p className="text-xl font-extrabold text-slate-900">{stats.pregnantCount} <span className="text-[10px] text-slate-500 font-normal">actives</span></p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">Pharmacie Domicile</p>
                <p className="text-xl font-extrabold text-slate-900">{stats.pendingDeliveries} <span className="text-[10px] text-slate-500 font-normal">à livrer</span></p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                <Beaker className="h-5 w-5" />
              </div>
              <div>
                <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">Lab / Échographie</p>
                <p className="text-xl font-extrabold text-slate-900">{stats.pendingLabs} <span className="text-[10px] text-slate-500 font-normal">en attente</span></p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex items-center space-x-3 col-span-2 md:col-span-1">
              <div className="p-2 rounded-lg bg-cyan-100 text-cyan-700 shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">Rdv Planifiés</p>
                <p className="text-xl font-extrabold text-slate-900">{stats.scheduledAppts}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ----------------- MAIN TABS NAVIGATION ----------------- */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-1.5 -mx-4 px-4 sm:mx-0 sm:px-0 space-x-1 scrollbar-none">
            
            <button
              onClick={() => setActiveTab('patients')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
                activeTab === 'patients'
                  ? 'bg-teal-50 text-teal-800 border-2 border-teal-600'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Dossiers Patients ({patientsList.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('consultation');
                // Auto preselect current selected patient in consultation if any
                if (selectedPatientId) {
                  setSelectedConsultationPatientId(String(selectedPatientId));
                }
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
                activeTab === 'consultation'
                  ? 'bg-teal-50 text-teal-800 border-2 border-teal-600'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
              }`}
            >
              <Stethoscope className="h-4 w-4" />
              <span>+ Nouvelle Consultation</span>
            </button>

            <button
              onClick={() => setActiveTab('maternity')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
                activeTab === 'maternity'
                  ? 'bg-teal-50 text-teal-800 border-2 border-teal-600'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
              }`}
            >
              <Baby className="h-4 w-4" />
              <span className="flex items-center space-x-1">
                <span>Suivi Grossesse</span>
                <span className="bg-lime-500 text-slate-900 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                  {stats.pregnantCount}
                </span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('pharmacy')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
                activeTab === 'pharmacy'
                  ? 'bg-teal-50 text-teal-800 border-2 border-teal-600'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
              }`}
            >
              <Pill className="h-4 w-4" />
              <span>Pharmacie &amp; Livraisons</span>
            </button>

            <button
              onClick={() => setActiveTab('lab')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
                activeTab === 'lab'
                  ? 'bg-teal-50 text-teal-800 border-2 border-teal-600'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
              }`}
            >
              <Beaker className="h-4 w-4" />
              <span>Laboratoire &amp; Écho</span>
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
                activeTab === 'appointments'
                  ? 'bg-teal-50 text-teal-800 border-2 border-teal-600'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Spécialités &amp; Rdv</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
                activeTab === 'about'
                  ? 'bg-teal-50 text-teal-800 border-2 border-teal-600'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Services B. Medical</span>
            </button>

          </div>
        </div>
      </div>

      {/* ----------------- CORE CONTENT BODY ----------------- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/* ========================================================
            TAB 1: PATIENTS DIRECTORY (DOSSIERS MÉDICAUX)
            ======================================================== */}
        {activeTab === 'patients' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Patient List (4 cols on lg) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-270px)]">
              
              {/* List Header with Search & Filter */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <ClipboardList className="h-4 w-4 text-teal-600" />
                    <span>Registre des Patients</span>
                  </h3>
                  
                  {activeRole === 'receptionist' || activeRole === 'doctor' ? (
                    <button
                      onClick={() => setShowAddPatientModal(true)}
                      className="bg-teal-600 hover:bg-teal-500 text-white p-1 px-2.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Ajouter</span>
                    </button>
                  ) : (
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium" title="Passez en mode Simulation Réception ou Médecin pour ajouter un patient">
                      Lecture seule
                    </span>
                  )}
                </div>

                {/* Search box */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher (Nom, Tél, Groupe...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-500">Genre:</span>
                    <select
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value)}
                      className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] focus:ring-1 focus:ring-teal-500 text-slate-700"
                    >
                      <option value="Tous">Tous</option>
                      <option value="Masculin">Masculin</option>
                      <option value="Féminin">Féminin</option>
                    </select>
                  </div>

                  <label className="flex items-center space-x-1 cursor-pointer text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={pregnantOnlyFilter}
                      onChange={(e) => setPregnantOnlyFilter(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500 h-3.5 w-3.5"
                    />
                    <span className="text-teal-700 font-semibold">🤰 Enceinte</span>
                  </label>
                </div>
              </div>

              {/* Patient List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {filteredPatients.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Users className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs">Aucun patient trouvé</p>
                    <p className="text-[10px] text-slate-400 mt-1">Modifiez les filtres de recherche ou réinitialisez la démo.</p>
                  </div>
                ) : (
                  filteredPatients.map((patient) => {
                    const isSelected = patient.id === selectedPatientId;
                    return (
                      <div
                        key={patient.id}
                        onClick={() => setSelectedPatientId(patient.id)}
                        className={`p-3.5 transition cursor-pointer relative hover:bg-slate-50 flex items-start space-x-3 ${
                          isSelected ? 'bg-teal-50/60 border-l-4 border-teal-600' : ''
                        }`}
                      >
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                          patient.isPregnant 
                            ? 'bg-rose-100 text-rose-700 border border-rose-300' 
                            : patient.gender === 'Féminin' 
                              ? 'bg-fuchsia-100 text-fuchsia-700' 
                              : 'bg-blue-100 text-blue-700'
                        }`}>
                          {patient.isPregnant ? '🤰' : patient.firstName[0] + patient.lastName[0]}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs text-slate-900 truncate">
                              {patient.firstName} {patient.lastName}
                            </h4>
                            {patient.bloodGroup && (
                              <span className="bg-slate-100 text-slate-800 font-extrabold text-[9px] px-1.5 py-0.2 rounded">
                                {patient.bloodGroup}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">{patient.phone}</p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{patient.address}</p>

                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full font-medium">
                              {patient.consultations.length} consult.
                            </span>
                            {patient.isPregnant && (
                              <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded-full font-bold">
                                Grossesse Suivie
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Expanded Medical Record (8 cols on lg) */}
            <div className="lg:col-span-8 space-y-4">
              {selectedPatient ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  
                  {/* Record Header */}
                  <div className="p-5 border-b border-slate-200 bg-linear-to-b from-slate-50 to-white">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      
                      <div className="flex items-center space-x-3.5">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-base uppercase shrink-0 ${
                          selectedPatient.isPregnant 
                            ? 'bg-rose-100 text-rose-700 border-2 border-rose-300 shadow-sm' 
                            : selectedPatient.gender === 'Féminin' 
                              ? 'bg-fuchsia-100 text-fuchsia-700' 
                              : 'bg-blue-100 text-blue-700'
                        }`}>
                          {selectedPatient.isPregnant ? '🤰' : selectedPatient.firstName[0] + selectedPatient.lastName[0]}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h2 className="text-base font-extrabold text-slate-900">
                              {selectedPatient.firstName} {selectedPatient.lastName}
                            </h2>
                            {selectedPatient.isPregnant && (
                              <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                                Maternité Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            Né(e) le : <strong className="text-slate-800">{selectedPatient.birthDate}</strong> • Genre : <strong className="text-slate-800">{selectedPatient.gender}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Top quick toggle & delete for receptionists / doctors */}
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        {selectedPatient.gender === 'Féminin' && (
                          <button
                            onClick={() => handleTogglePregnancyStatus(selectedPatient.id, !selectedPatient.isPregnant)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                              selectedPatient.isPregnant
                                ? 'bg-rose-100 text-rose-700 border border-rose-300 hover:bg-rose-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            <Baby className="h-3.5 w-3.5" />
                            <span>{selectedPatient.isPregnant ? 'Grossesse active' : 'Marquer Enceinte'}</span>
                          </button>
                        )}

                        {activeRole === 'receptionist' && (
                          <button
                            onClick={() => handleDeletePatient(selectedPatient.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 p-1 px-2.5 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Supprimer</span>
                          </button>
                        )}
                      </div>

                    </div>

                    {/* Quick Demographics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Téléphone :</span>
                        <span className="font-bold text-slate-800 flex items-center space-x-1">
                          <Smartphone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{selectedPatient.phone}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Adresse :</span>
                        <span className="font-bold text-slate-800 flex items-center space-x-1 truncate" title={selectedPatient.address}>
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{selectedPatient.address}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Groupe Sanguin :</span>
                        <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 text-[11px] inline-block">
                          {selectedPatient.bloodGroup || 'Inconnu'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Allergies signalées :</span>
                        <span className={`font-bold ${selectedPatient.allergies ? 'text-red-600 underline decoration-dotted' : 'text-slate-600'}`}>
                          {selectedPatient.allergies || 'Aucune connue'}
                        </span>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    {(selectedPatient.emergencyContactName || selectedPatient.emergencyContactPhone) && (
                      <div className="mt-3 bg-amber-50/50 border border-amber-200/50 p-2.5 rounded-xl text-[11px] text-slate-700 flex flex-wrap items-center gap-2 justify-between">
                        <span className="font-semibold text-amber-900 flex items-center space-x-1.5">
                          <Activity className="h-3.5 w-3.5 text-amber-600" />
                          <span>Contact d'Urgence :</span>
                        </span>
                        <span>
                          <strong className="text-slate-900">{selectedPatient.emergencyContactName}</strong> 
                          {selectedPatient.emergencyContactPhone && ` (${selectedPatient.emergencyContactPhone})`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Record Tabs / Detailed Timelines */}
                  <div className="p-5 space-y-6">
                    
                    {/* MATERNITY MINI PROGRESS CARD (if pregnant) */}
                    {selectedPatient.isPregnant && selectedPatient.maternityRecord && (
                      <div className="bg-rose-50/80 rounded-2xl border border-rose-150 p-4 relative overflow-hidden">
                        <div className="absolute right-3 top-3 opacity-10">
                          <Baby className="h-20 w-20 text-rose-900" />
                        </div>
                        <div className="flex items-center justify-between mb-3 border-b border-rose-200/50 pb-2">
                          <h4 className="font-extrabold text-xs text-rose-900 flex items-center space-x-1.5">
                            <Baby className="h-4 w-4 text-rose-700" />
                            <span>Suivi Gynéco-Obstétrique Actif (Maternité)</span>
                          </h4>
                          <button
                            onClick={() => {
                              setEditingMaternityPatientId(selectedPatient.id);
                              setMaternityForm({
                                lastMenstrualPeriod: selectedPatient.maternityRecord.lastMenstrualPeriod || '',
                                estimatedDeliveryDate: selectedPatient.maternityRecord.estimatedDeliveryDate || '',
                                gravida: selectedPatient.maternityRecord.gravida || 1,
                                para: selectedPatient.maternityRecord.para || 0,
                                pregnancyNotes: selectedPatient.maternityRecord.pregnancyNotes || ''
                              });
                            }}
                            className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md transition"
                          >
                            Éditer dossier prénatal
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-rose-950">
                          <div>
                            <span className="text-rose-700 block text-[10px] uppercase font-semibold">Date Dernières Règles (DDR)</span>
                            <span className="font-bold">{selectedPatient.maternityRecord.lastMenstrualPeriod || 'Non saisie'}</span>
                          </div>
                          <div>
                            <span className="text-rose-700 block text-[10px] uppercase font-semibold">Terme Prévu (DPA)</span>
                            <span className="font-extrabold text-rose-800">{selectedPatient.maternityRecord.estimatedDeliveryDate || 'Calculé à l\'écho'}</span>
                          </div>
                          <div>
                            <span className="text-rose-700 block text-[10px] uppercase font-semibold">Gestité / Parité</span>
                            <span className="font-bold">Gravida {selectedPatient.maternityRecord.gravida} • Para {selectedPatient.maternityRecord.para}</span>
                          </div>
                          <div>
                            <span className="text-rose-700 block text-[10px] uppercase font-semibold">Dernières Notes</span>
                            <p className="italic text-[11px] truncate" title={selectedPatient.maternityRecord.pregnancyNotes}>
                              "{selectedPatient.maternityRecord.pregnancyNotes || 'Aucune note'}"
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* HISTORY SECTION 1: CONSULTATIONS */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center space-x-2 border-b border-slate-100 pb-2">
                        <Stethoscope className="h-4 w-4 text-teal-600" />
                        <span>Historique des Consultations ({selectedPatient.consultations.length})</span>
                      </h3>

                      {selectedPatient.consultations.length === 0 ? (
                        <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
                          Aucune consultation enregistrée dans ce dossier médical. Rédigez-en une dans l'onglet "Nouvelle Consultation".
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {selectedPatient.consultations.map((consult: any) => (
                            <div key={consult.id} className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 p-4 rounded-xl text-xs space-y-2.5">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/40 pb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-extrabold text-slate-800">{consult.service}</span>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-slate-500">Par {consult.doctorName}</span>
                                </div>
                                <span className="bg-slate-200/70 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px] flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{new Date(consult.consultationDate).toLocaleDateString('fr-FR')}</span>
                                </span>
                              </div>

                              {/* Vitals row */}
                              <div className="flex items-center space-x-4 flex-wrap gap-y-1.5 bg-white p-2 rounded-lg border border-slate-100 text-[11px]">
                                {consult.bloodPressure && (
                                  <span>Tension : <strong className="text-teal-700">{consult.bloodPressure}</strong></span>
                                )}
                                {consult.temperature && (
                                  <span>Témpérature : <strong className="text-teal-700">{consult.temperature}</strong></span>
                                )}
                                {consult.weight && (
                                  <span>Poids : <strong className="text-teal-700">{consult.weight}</strong></span>
                                )}
                                {consult.heartRate && (
                                  <span>Fréq. Cardiaque : <strong className="text-teal-700">{consult.heartRate}</strong></span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                <div>
                                  <strong className="text-slate-400 block mb-0.5 text-[10px] uppercase">Symptômes signalés :</strong>
                                  <p className="text-slate-700 leading-relaxed italic bg-white p-2 rounded border border-slate-150">
                                    "{consult.symptoms}"
                                  </p>
                                </div>
                                <div>
                                  <strong className="text-slate-400 block mb-0.5 text-[10px] uppercase">Diagnostic Posé :</strong>
                                  <p className="text-slate-800 font-bold leading-relaxed bg-white p-2 rounded border border-slate-150">
                                    {consult.diagnosis}
                                  </p>
                                </div>
                              </div>

                              {(consult.treatmentPlan || consult.notes) && (
                                <div className="bg-white p-2.5 rounded-lg border border-slate-150 space-y-1.5">
                                  {consult.treatmentPlan && (
                                    <div>
                                      <strong className="text-slate-500 text-[10px] uppercase">Plan de Traitement :</strong>
                                      <p className="text-slate-800 font-semibold">{consult.treatmentPlan}</p>
                                    </div>
                                  )}
                                  {consult.notes && (
                                    <p className="text-slate-500 text-[11px] italic">Note : {consult.notes}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* HISTORY SECTION 2: PRESCRIPTIONS & PHARMACY */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center space-x-2 border-b border-slate-100 pb-2">
                        <Pill className="h-4 w-4 text-teal-600" />
                        <span>Prescriptions &amp; Dispensation Pharmacie ({selectedPatient.prescriptions.length})</span>
                      </h3>

                      {selectedPatient.prescriptions.length === 0 ? (
                        <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
                          Aucun médicament prescrit pour ce patient.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {selectedPatient.prescriptions.map((presc: any) => {
                            let meds: Medication[] = [];
                            try {
                              meds = JSON.parse(presc.medicationsJson);
                            } catch(e) {
                              meds = [];
                            }
                            return (
                              <div key={presc.id} className="bg-slate-50/50 border border-slate-200/60 p-4 rounded-xl text-xs space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <p className="font-semibold text-slate-800">Prescrit par {presc.doctorName}</p>
                                    <p className="text-[10px] text-slate-400">Date : {new Date(presc.prescriptionDate).toLocaleDateString('fr-FR')}</p>
                                  </div>

                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {/* Filled Status pill */}
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      presc.isFilled 
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                                    }`}>
                                      {presc.isFilled ? '💊 Servie / Prêt' : '⌛ En attente pharmacie'}
                                    </span>

                                    {/* Home delivery pill if applicable */}
                                    {presc.requiresDelivery && (
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 ${
                                        presc.deliveryStatus === 'Livré'
                                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                          : presc.deliveryStatus === 'En cours'
                                            ? 'bg-purple-100 text-purple-800 border border-purple-200 animate-pulse'
                                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                                      }`}>
                                        <Truck className="h-3 w-3 shrink-0" />
                                        <span>Livraison : {presc.deliveryStatus}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Medications grid */}
                                <div className="bg-white rounded-lg border border-slate-150 overflow-hidden divide-y divide-slate-100">
                                  <div className="grid grid-cols-4 gap-2 p-2 bg-slate-50 font-bold text-[10px] text-slate-500 uppercase">
                                    <span>Médicament</span>
                                    <span>Dosage</span>
                                    <span>Fréquence</span>
                                    <span>Durée</span>
                                  </div>
                                  {meds.map((med, idx) => (
                                    <div key={idx} className="grid grid-cols-4 gap-2 p-2 text-[11px] text-slate-700">
                                      <span className="font-bold text-slate-900">{med.name}</span>
                                      <span>{med.dosage}</span>
                                      <span>{med.frequency}</span>
                                      <span>{med.duration}</span>
                                    </div>
                                  ))}
                                </div>

                                {presc.requiresDelivery && presc.deliveryAddress && (
                                  <p className="text-[11px] bg-slate-100 p-2 rounded text-slate-600 flex items-start space-x-1">
                                    <Truck className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                                    <span><strong>Adresse de livraison :</strong> {presc.deliveryAddress}</span>
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* HISTORY SECTION 3: LABORATORY & ULTRASOUND REPORTS */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center space-x-2 border-b border-slate-100 pb-2">
                        <Beaker className="h-4 w-4 text-teal-600" />
                        <span>Examens de Laboratoire &amp; Échographies ({selectedPatient.labRequests.length})</span>
                      </h3>

                      {selectedPatient.labRequests.length === 0 ? (
                        <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
                          Aucune analyse de labo ni échographie demandée.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {selectedPatient.labRequests.map((req: any) => (
                            <div key={req.id} className="bg-slate-50/50 border border-slate-200/60 p-4 rounded-xl text-xs space-y-2.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <span className="font-extrabold text-slate-800 text-xs">{req.testType}</span>
                                  <p className="text-[10px] text-slate-400 mt-0.5">Demande de {req.requestedBy} • {new Date(req.requestDate).toLocaleDateString('fr-FR')}</p>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                    req.category === 'Échographie' 
                                      ? 'bg-violet-100 text-violet-800 border border-violet-200' 
                                      : 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                                  }`}>
                                    {req.category}
                                  </span>

                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    req.status === 'Réalisé' 
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                                  }`}>
                                    {req.status === 'Réalisé' ? 'Réalisé' : 'En attente résultats'}
                                  </span>
                                </div>
                              </div>

                              {req.status === 'Réalisé' ? (
                                <div className="bg-emerald-50/45 border border-emerald-150 p-3 rounded-lg text-slate-800">
                                  <div className="flex items-center justify-between text-[10px] text-emerald-900 border-b border-emerald-200/40 pb-1.5 mb-1.5 font-bold">
                                    <span>RAPPORT D'EXAMEN</span>
                                    <span>Signé par {req.labTechnician} le {new Date(req.resultDate).toLocaleDateString('fr-FR')}</span>
                                  </div>
                                  <p className="whitespace-pre-wrap font-mono leading-relaxed text-[11px]">{req.resultDetails}</p>
                                </div>
                              ) : (
                                <div className="p-3 bg-white rounded-lg border border-dashed border-slate-300 flex items-center justify-between">
                                  <span className="text-slate-500 text-[11px] italic">Résultats non saisis.</span>
                                  {activeRole === 'lab_tech' && (
                                    <button
                                      onClick={() => {
                                        setSelectedLabRequestId(req.id);
                                        setLabResultText('');
                                        setActiveTab('lab');
                                      }}
                                      className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-[10px] px-2.5 py-1 rounded transition"
                                    >
                                      Saisir les résultats
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* HISTORY SECTION 4: APPOINTMENTS */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center space-x-2 border-b border-slate-100 pb-2">
                        <Calendar className="h-4 w-4 text-teal-600" />
                        <span>Rendez-vous et Spécialités ({selectedPatient.appointments.length})</span>
                      </h3>

                      {selectedPatient.appointments.length === 0 ? (
                        <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
                          Aucun rendez-vous planifié.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedPatient.appointments.map((appt: any) => (
                            <div key={appt.id} className="bg-slate-50/50 border border-slate-200/60 p-3 rounded-xl text-xs flex flex-col justify-between space-y-2">
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="font-extrabold text-slate-800 text-xs bg-lime-100 text-lime-900 px-1.5 py-0.2 rounded">
                                    {appt.speciality}
                                  </span>
                                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                    appt.status === 'Planifié' ? 'bg-amber-100 text-amber-800' :
                                    appt.status === 'En cours' ? 'bg-purple-100 text-purple-800' :
                                    appt.status === 'Terminé' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {appt.status}
                                  </span>
                                </div>
                                <p className="text-slate-800 font-bold">Médecin : {appt.doctorName}</p>
                                <p className="text-slate-500 italic mt-1">"{appt.reason}"</p>
                              </div>

                              <div className="pt-2 border-t border-slate-200/40 text-[10px] text-slate-400 flex justify-between items-center">
                                <span>{new Date(appt.appointmentDate).toLocaleString('fr-FR')}</span>
                                {activeRole === 'receptionist' && appt.status === 'Planifié' && (
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => handleUpdateAppointment(appt.id, 'Terminé')}
                                      className="text-emerald-600 hover:text-emerald-800 font-bold"
                                    >
                                      Terminer
                                    </button>
                                    <span className="text-slate-300">|</span>
                                    <button 
                                      onClick={() => handleUpdateAppointment(appt.id, 'Annulé')}
                                      className="text-rose-600 hover:text-rose-800 font-bold"
                                    >
                                      Annuler
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs">
                  <Users className="h-16 w-16 mx-auto text-slate-200 mb-4" />
                  <p className="text-base font-bold text-slate-700">Aucun dossier patient sélectionné</p>
                  <p className="text-xs text-slate-400 mt-2">Inscrivez un nouveau patient ou choisissez un patient dans la liste de gauche pour consulter son historique médical complet.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 2: CREATE CONSULTATION (🩺 MÉDECINS)
            ======================================================== */}
        {activeTab === 'consultation' && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">Fiche de Consultation Clinique</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Saisie par le praticien de garde</p>
                </div>
              </div>
              <span className="bg-teal-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg">
                Rôle Actif : Praticien Médical
              </span>
            </div>

            <form onSubmit={handleAddConsultationSubmit} className="p-6 space-y-6 text-xs">
              
              {/* Select Patient */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Sélectionner le Patient <span className="text-red-500">*</span></label>
                  <select
                    value={selectedConsultationPatientId}
                    onChange={(e) => setSelectedConsultationPatientId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 text-slate-800"
                    required
                  >
                    <option value="">-- Choisissez un patient --</option>
                    {patientsList.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} {p.isPregnant ? '🤰' : ''} ({p.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Service de Consultation <span className="text-red-500">*</span></label>
                  <select
                    value={consultationService}
                    onChange={(e) => setConsultationService(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 text-slate-800"
                  >
                    <option value="Gynéco-Obstétrique (Maternité)">Gynéco-Obstétrique (Maternité)</option>
                    <option value="Médecine Interne">Médecine Interne</option>
                    <option value="Pédiatrie">Pédiatrie</option>
                    <option value="Chirurgie">Chirurgie</option>
                    <option value="Cardiologie">Cardiologie</option>
                    <option value="Dermatologie">Dermatologie</option>
                    <option value="Diabétologie">Diabétologie</option>
                    <option value="Urologie">Urologie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Praticien Consultateur <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={consultationDoctor}
                    onChange={(e) => setConsultationDoctor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 text-slate-800"
                    placeholder="Nom du médecin"
                    required
                  />
                </div>
              </div>

              {/* Patient Vitals Tracker */}
              <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100/70">
                <h4 className="font-extrabold text-[11px] text-teal-900 uppercase tracking-wider mb-3 flex items-center space-x-1">
                  <Activity className="h-4 w-4 text-teal-700" />
                  <span>Constantes Vitales du Patient (Vitals)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Tension Artérielle (e.g., 120/80)</label>
                    <input
                      type="text"
                      value={bloodPressure}
                      onChange={(e) => setBloodPressure(e.target.value)}
                      placeholder="Tension"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Température (°C)</label>
                    <input
                      type="text"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      placeholder="e.g. 37.2"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Poids (kg)</label>
                    <input
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g. 74"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Fréq. Cardiaque (bpm)</label>
                    <input
                      type="text"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      placeholder="e.g. 80"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Symptoms & Diagnosis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Symptômes et Plaintes <span className="text-red-500">*</span></label>
                  <textarea
                    rows={3}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Saisissez les symptômes ou motifs de consultation..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Diagnostic Clinique <span className="text-red-500">*</span></label>
                  <textarea
                    rows={3}
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Saisissez le diagnostic médical principal..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 text-slate-800"
                    required
                  />
                </div>
              </div>

              {/* Treatment & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Plan de Traitement / Recommandations</label>
                  <textarea
                    rows={2.5}
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    placeholder="Régime, repos, directives générales..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Notes Additionnelles</label>
                  <textarea
                    rows={2.5}
                    value={consultationNotes}
                    onChange={(e) => setConsultationNotes(e.target.value)}
                    placeholder="Observations particulières, antécédents, etc."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 text-slate-800"
                  />
                </div>
              </div>

              {/* PRESCRIPTION BLOCK */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-slate-50 p-3 flex items-center justify-between border-b border-slate-100">
                  <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={addPrescription}
                      onChange={(e) => setAddPrescription(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                    />
                    <Pill className="h-4 w-4 text-teal-600 shrink-0" />
                    <span>Rédiger une Ordonnance de médicaments</span>
                  </label>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                    Liaison Pharmacie
                  </span>
                </div>

                {addPrescription && (
                  <div className="p-4 space-y-4 bg-white">
                    <div className="space-y-2">
                      <div className="grid grid-cols-12 gap-2 text-slate-500 font-bold text-[10px] uppercase">
                        <div className="col-span-4">Nom de la molécule / médicament</div>
                        <div className="col-span-2">Posologie</div>
                        <div className="col-span-3">Fréquence</div>
                        <div className="col-span-2">Durée</div>
                        <div className="col-span-1"></div>
                      </div>

                      {medications.map((med, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2">
                          <div className="col-span-4">
                            <input
                              type="text"
                              value={med.name}
                              onChange={(e) => {
                                const list = [...medications];
                                list[index].name = e.target.value;
                                setMedications(list);
                              }}
                              placeholder="e.g. Paracétamol, Tardyferon"
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="text"
                              value={med.dosage}
                              onChange={(e) => {
                                const list = [...medications];
                                list[index].dosage = e.target.value;
                                setMedications(list);
                              }}
                              placeholder="e.g. 500mg"
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                              type="text"
                              value={med.frequency}
                              onChange={(e) => {
                                const list = [...medications];
                                list[index].frequency = e.target.value;
                                setMedications(list);
                              }}
                              placeholder="e.g. 3 fois par jour"
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="text"
                              value={med.duration}
                              onChange={(e) => {
                                const list = [...medications];
                                list[index].duration = e.target.value;
                                setMedications(list);
                              }}
                              placeholder="e.g. 5 jours"
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
                            />
                          </div>
                          <div className="col-span-1 text-center">
                            {medications.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setMedications(medications.filter((_, i) => i !== index));
                                }}
                                className="text-red-500 hover:text-red-700 p-2 font-bold"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }])}
                        className="text-teal-700 hover:text-teal-800 font-bold text-xs flex items-center space-x-1 mt-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Ajouter une ligne de traitement</span>
                      </button>
                    </div>

                    {/* Home delivery checkbox (Matching B. Medical picture "Pharmacie (livraison à domicile)") */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                      <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800 bg-amber-50/50 p-2 rounded-lg border border-amber-200/50">
                        <input
                          type="checkbox"
                          checked={requiresDelivery}
                          onChange={(e) => {
                            setRequiresDelivery(e.target.checked);
                            // Auto populate delivery address with patient's address if possible
                            if (e.target.checked && selectedConsultationPatientId) {
                              const pat = patientsList.find(p => p.id === Number(selectedConsultationPatientId));
                              if (pat) setDeliveryAddress(pat.address);
                            }
                          }}
                          className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                        />
                        <Truck className="h-4 w-4 text-amber-700 shrink-0" />
                        <span className="text-amber-900">Activer le service de livraison à domicile B. Medical (Pharmacie)</span>
                      </label>

                      {requiresDelivery && (
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Adresse exacte de Livraison à domicile</label>
                          <textarea
                            rows={2}
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="Entrez l'adresse de livraison et consignes de repérage..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                            required
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* LAB / IMAGING BLOCK */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-slate-50 p-3 flex items-center justify-between border-b border-slate-100">
                  <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={addLabRequest}
                      onChange={(e) => setAddLabRequest(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                    />
                    <Beaker className="h-4 w-4 text-teal-600 shrink-0" />
                    <span>Prescrire un Examen de Laboratoire / Échographie</span>
                  </label>
                  <span className="text-[10px] bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full font-bold">
                    Liaison Technique
                  </span>
                </div>

                {addLabRequest && (
                  <div className="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Catégorie d'Examen</label>
                      <div className="flex space-x-4 mt-1">
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="labCategory"
                            checked={labCategory === 'Laboratoire'}
                            onChange={() => {
                              setLabCategory('Laboratoire');
                              setLabTestType('Glycémie à jeun & Hémoglobine Glyquée (HbA1c)');
                            }}
                            className="text-teal-600 focus:ring-teal-500"
                          />
                          <span className="font-semibold text-slate-700">Laboratoire d'analyses</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="labCategory"
                            checked={labCategory === 'Échographie'}
                            onChange={() => {
                              setLabCategory('Échographie');
                              setLabTestType('Échographie Morphologique du 2ème Trimestre');
                            }}
                            className="text-teal-600 focus:ring-teal-500"
                          />
                          <span className="font-semibold text-slate-700">Échographie / Imagerie</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Type d'examen prescrit</label>
                      <select
                        value={labTestType}
                        onChange={(e) => setLabTestType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 text-slate-800"
                      >
                        {labCategory === 'Laboratoire' ? (
                          <>
                            <option value="Glycémie à jeun & Hémoglobine Glyquée (HbA1c)">Glycémie à jeun &amp; HbA1c</option>
                            <option value="Hémogramme Complet (NFS)">Hémogramme Complet (NFS)</option>
                            <option value="Bilan Rénal (Urée & Créatinine)">Bilan Rénal (Urée, Créat)</option>
                            <option value="Analyse d'Urine (Culot & Chimie)">Analyse d'Urine</option>
                            <option value="Goutte Épaisse (Paludisme)">Goutte Épaisse (Paludisme)</option>
                            <option value="Groupe Sanguin & Rhesus">Groupe Sanguin &amp; Rhesus</option>
                          </>
                        ) : (
                          <>
                            <option value="Échographie Morphologique du 2ème Trimestre">Échographie Morphologique (2ème Trimestre)</option>
                            <option value="Échographie Obstétricale de Datation">Échographie Obstétricale de Datation</option>
                            <option value="Échographie Pelvienne Gynécologique">Échographie Pelvienne Gynécologique</option>
                            <option value="Échographie Abdominale Complète">Échographie Abdominale</option>
                            <option value="Échographie Rénale et Voies Urinaires">Échographie Rénale / Urinaire</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit panel */}
              <div className="flex justify-end pt-4 border-t border-slate-150">
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-teal-750 hover:bg-teal-800 text-white font-bold py-3 px-6 rounded-xl shadow-md flex items-center space-x-2 cursor-pointer transition disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  <span>Enregistrer la consultation dans le dossier relationnel</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ========================================================
            TAB 3: PREGNANCY FOLLOW-UP (🤰 GYNECO-OBSTÉTRIQUE / MATERNITÉ)
            ======================================================== */}
        {activeTab === 'maternity' && (
          <div className="space-y-6">
            
            {/* Header Jumbotron */}
            <div className="bg-gradient-to-r from-rose-700 to-rose-900 rounded-2xl p-6 text-white border-2 border-rose-400/40 shadow-sm relative overflow-hidden">
              <div className="absolute right-10 -bottom-6 opacity-10">
                <Baby className="h-44 w-44" />
              </div>
              
              <div className="max-w-xl">
                <span className="bg-rose-500/35 text-rose-100 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-rose-400/30">
                  Centre d'excellence de Maternité B. Medical
                </span>
                <h2 className="text-xl font-extrabold mt-3 text-white">
                  Gynécologie Obstétrique &amp; Suivi des Futures Mamans
                </h2>
                <p className="text-xs text-rose-100 mt-1.5 leading-relaxed">
                  Conformément à nos engagements (Nos Équipes Vous Accompagnent), nous suivons les grossesses de l'admission à la délivrance. Ce tableau croise les données démographiques des patientes avec leurs indicateurs de maternité.
                </p>
              </div>
            </div>

            {/* List of pregnant patients */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800">
                  Dossiers Maternité Actifs ({patientsList.filter(p => p.isPregnant).length})
                </h3>
                <span className="text-[10px] text-slate-500">Mise à jour en temps réel</span>
              </div>

              {patientsList.filter(p => p.isPregnant).length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Baby className="h-12 w-12 mx-auto text-rose-200 mb-3" />
                  <p className="font-bold text-slate-600">Aucune maman enceinte suivie actuellement</p>
                  <p className="text-[10px] mt-1 text-slate-400">Pour ajouter une maman enceinte, inscrivez-la dans l'onglet patients ou marquez une patiente existante comme "Enceinte".</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold uppercase text-[10px]">
                        <th className="p-3">Patiente</th>
                        <th className="p-3">Tél &amp; Adresse</th>
                        <th className="p-3">Groupe Sanguin</th>
                        <th className="p-3">Dernières Règles (DDR)</th>
                        <th className="p-3">Accouchement Prévu (DPA)</th>
                        <th className="p-3">Indices (Gravida / Para)</th>
                        <th className="p-3">Observations prénatales</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {patientsList.filter(p => p.isPregnant).map((patient) => (
                        <tr key={patient.id} className="hover:bg-slate-50/55">
                          <td className="p-3">
                            <div className="flex items-center space-x-2.5">
                              <div className="h-8 w-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                                🤰
                              </div>
                              <div>
                                <strong className="text-slate-900 block">{patient.firstName} {patient.lastName}</strong>
                                <span className="text-[10px] text-slate-400">Né le {patient.birthDate}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="block font-medium">{patient.phone}</span>
                            <span className="text-[10px] text-slate-400 truncate max-w-xs block" title={patient.address}>{patient.address}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded px-2 py-0.5 text-[11px]">
                              {patient.bloodGroup || 'O+'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-700">{patient.maternityRecord?.lastMenstrualPeriod || 'Non définie'}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded">
                              {patient.maternityRecord?.estimatedDeliveryDate || 'Non spécifié'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-medium">
                              G: <strong className="text-slate-900">{patient.maternityRecord?.gravida || 1}</strong> • 
                              P: <strong className="text-slate-900">{patient.maternityRecord?.para || 0}</strong>
                            </span>
                          </td>
                          <td className="p-3">
                            <p className="italic text-slate-600 line-clamp-2 max-w-xs">
                              "{patient.maternityRecord?.pregnancyNotes || 'Aucune observation saisie.'}"
                            </p>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingMaternityPatientId(patient.id);
                                  setMaternityForm({
                                    lastMenstrualPeriod: patient.maternityRecord?.lastMenstrualPeriod || '',
                                    estimatedDeliveryDate: patient.maternityRecord?.estimatedDeliveryDate || '',
                                    gravida: patient.maternityRecord?.gravida || 1,
                                    para: patient.maternityRecord?.para || 0,
                                    pregnancyNotes: patient.maternityRecord?.pregnancyNotes || ''
                                  });
                                }}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Éditer
                              </button>

                              <button
                                onClick={() => setSelectedPatientId(patient.id)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-bold"
                              >
                                Dossier complet
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* MATERNITY EDIT FORM DIALOG */}
            {editingMaternityPatientId !== null && (
              <div className="bg-rose-50 rounded-2xl border border-rose-200 p-6 max-w-2xl mx-auto space-y-4">
                <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                  <h3 className="font-black text-rose-900 flex items-center space-x-2">
                    <Baby className="h-5 w-5 text-rose-700" />
                    <span>Mise à jour du dossier de suivi prénatal</span>
                  </h3>
                  <button onClick={() => setEditingMaternityPatientId(null)} className="text-rose-900 font-bold hover:opacity-75">
                    ✕ Fermer
                  </button>
                </div>

                <form onSubmit={handleSaveMaternityRecord} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-rose-950">
                  
                  <div>
                    <label className="block text-rose-900 font-bold mb-1">Date des Dernières Règles (DDR)</label>
                    <input
                      type="date"
                      value={maternityForm.lastMenstrualPeriod}
                      onChange={(e) => {
                        const ddrVal = e.target.value;
                        // Auto estimate delivery date (9 months ahead)
                        let dpaVal = '';
                        if (ddrVal) {
                          const date = new Date(ddrVal);
                          date.setMonth(date.getMonth() + 9);
                          date.setDate(date.getDate() + 7);
                          dpaVal = date.toISOString().split('T')[0];
                        }
                        setMaternityForm({
                          ...maternityForm,
                          lastMenstrualPeriod: ddrVal,
                          estimatedDeliveryDate: dpaVal
                        });
                      }}
                      className="w-full bg-white border border-rose-300 rounded-lg p-2.5 text-slate-800"
                    />
                    <span className="text-[10px] text-rose-700 mt-1 block">La DPA (Terme d'accouchement) sera estimée automatiquement (+9 mois et 7j).</span>
                  </div>

                  <div>
                    <label className="block text-rose-900 font-bold mb-1">Date Prévue d'Accouchement (DPA)</label>
                    <input
                      type="date"
                      value={maternityForm.estimatedDeliveryDate}
                      onChange={(e) => setMaternityForm({ ...maternityForm, estimatedDeliveryDate: e.target.value })}
                      className="w-full bg-white border border-rose-300 rounded-lg p-2.5 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-rose-900 font-bold mb-1">Nombre de Grossesses (Gravida / Gestité)</label>
                    <input
                      type="number"
                      min={1}
                      value={maternityForm.gravida}
                      onChange={(e) => setMaternityForm({ ...maternityForm, gravida: Number(e.target.value) })}
                      className="w-full bg-white border border-rose-300 rounded-lg p-2.5 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-rose-900 font-bold mb-1">Nombre d'Accouchements (Para / Parité)</label>
                    <input
                      type="number"
                      min={0}
                      value={maternityForm.para}
                      onChange={(e) => setMaternityForm({ ...maternityForm, para: Number(e.target.value) })}
                      className="w-full bg-white border border-rose-300 rounded-lg p-2.5 text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-rose-900 font-bold mb-1">Observations obstétricales / Notes</label>
                    <textarea
                      rows={3}
                      value={maternityForm.pregnancyNotes}
                      onChange={(e) => setMaternityForm({ ...maternityForm, pregnancyNotes: e.target.value })}
                      placeholder="e.g. Tension à surveiller, antécédents de césarienne..."
                      className="w-full bg-white border border-rose-300 rounded-lg p-2.5 text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2 flex justify-end space-x-2 pt-2 border-t border-rose-200">
                    <button
                      type="button"
                      onClick={() => setEditingMaternityPatientId(null)}
                      className="bg-white hover:bg-rose-100 text-rose-900 px-4 py-2 rounded-lg font-bold"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="bg-rose-700 hover:bg-rose-800 text-white px-5 py-2 rounded-lg font-bold"
                    >
                      Enregistrer les modifications
                    </button>
                  </div>

                </form>
              </div>
            )}

          </div>
        )}

        {/* ========================================================
            TAB 4: PHARMACY & DELIVERIES (💊 PHARMACIENS)
            ======================================================== */}
        {activeTab === 'pharmacy' && (
          <div className="space-y-6">
            
            {/* Pharmacy header */}
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 rounded-2xl p-6 text-white border-2 border-indigo-400/40 shadow-sm relative overflow-hidden">
              <div className="absolute right-10 -bottom-6 opacity-10">
                <Pill className="h-44 w-44" />
              </div>
              
              <div className="max-w-xl">
                <span className="bg-indigo-500/35 text-indigo-100 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-indigo-400/30">
                  Service Pharmacie B. Medical
                </span>
                <h2 className="text-xl font-extrabold mt-3 text-white flex items-center space-x-2">
                  <Pill className="h-6 w-6 text-lime-400 shrink-0" />
                  <span>Pharmacie interne &amp; Livraison à Domicile</span>
                </h2>
                <p className="text-xs text-indigo-100 mt-1.5 leading-relaxed">
                  Conformément au flyer de l'établissement (Pharmacie - Livraison à domicile), ce module permet aux pharmaciens de préparer les ordonnances issues des consultations cliniques et d'enclencher la logistique de livraison à Lubumbashi.
                </p>
              </div>
            </div>

            {/* Prescriptions and Delivery Tracking */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800">
                  Ordonnances Actives
                </h3>
                <span className="text-[10px] text-indigo-700 font-bold uppercase bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-150">
                  Vue Pharmacien
                </span>
              </div>

              {/* Flatten prescriptions from patients */}
              {(() => {
                const allPrescs: any[] = [];
                patientsList.forEach(p => {
                  p.prescriptions.forEach((pr: any) => {
                    allPrescs.push({ ...pr, patient: p });
                  });
                });

                if (allPrescs.length === 0) {
                  return (
                    <div className="p-12 text-center text-slate-400">
                      <Pill className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                      <p className="font-bold text-slate-600">Aucune ordonnance émise</p>
                      <p className="text-[10px] mt-1 text-slate-400">Pour tester, créez d'abord une consultation pour un patient en cochant l'option ordonnance.</p>
                    </div>
                  );
                }

                return (
                  <div className="divide-y divide-slate-100">
                    {allPrescs.map((presc) => {
                      let meds: Medication[] = [];
                      try {
                        meds = JSON.parse(presc.medicationsJson);
                      } catch (e) {
                        meds = [];
                      }

                      return (
                        <div key={presc.id} className="p-4 sm:p-5 hover:bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                          
                          {/* Left Details */}
                          <div className="space-y-2 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-extrabold text-slate-900 text-sm">
                                Ordonnance #{presc.id}
                              </span>
                              <span className="text-slate-300">|</span>
                              <span className="text-slate-500">
                                Patient : <strong className="text-slate-900">{presc.patient.firstName} {presc.patient.lastName}</strong> ({presc.patient.phone})
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-400 text-[10px]">
                                {new Date(presc.prescriptionDate).toLocaleString('fr-FR')}
                              </span>
                            </div>

                            {/* Medications listing pills */}
                            <div className="flex flex-wrap gap-1.5">
                              {meds.map((m, idx) => (
                                <span key={idx} className="bg-slate-100 text-slate-800 text-[11px] px-2 py-1 rounded-md font-medium border border-slate-200">
                                  <strong>{m.name}</strong> ({m.dosage}) - <span className="text-slate-500 text-[10px]">{m.frequency}</span>
                                </span>
                              ))}
                            </div>

                            {/* Delivery Section */}
                            {presc.requiresDelivery ? (
                              <div className="bg-amber-50 text-amber-900 p-2.5 rounded-lg border border-amber-200/50 text-[11px] flex items-start space-x-1.5">
                                <Truck className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-amber-950 block mb-0.5">⚠️ Demande de Livraison à Domicile</strong>
                                  <p>{presc.deliveryAddress || presc.patient.address}</p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-medium inline-block">
                                Retrait physique sur place à la clinique
                              </span>
                            )}
                          </div>

                          {/* Right Controls */}
                          <div className="shrink-0 flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 w-full md:w-auto justify-between md:justify-end">
                            
                            {/* Prep control */}
                            <div className="flex items-center space-x-1.5">
                              <span className="text-slate-500 font-semibold text-[11px]">Préparation :</span>
                              <button
                                onClick={() => handleUpdatePrescription(presc.id, !presc.isFilled, presc.deliveryStatus)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  presc.isFilled 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                    : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                                }`}
                              >
                                {presc.isFilled ? '💊 Servie' : '⌛ Marquer Prêt'}
                              </button>
                            </div>

                            {/* Delivery control */}
                            {presc.requiresDelivery && (
                              <div className="flex items-center space-x-1 border-l border-slate-200 pl-2.5">
                                <span className="text-slate-500 font-semibold text-[11px] mr-1">Livraison :</span>
                                <select
                                  value={presc.deliveryStatus || 'En attente'}
                                  onChange={(e) => handleUpdatePrescription(presc.id, presc.isFilled, e.target.value as any)}
                                  className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 font-bold focus:ring-1 focus:ring-indigo-500"
                                >
                                  <option value="En attente">En attente</option>
                                  <option value="En cours">En cours de trajet</option>
                                  <option value="Livré">Livré à domicile ✅</option>
                                </select>
                              </div>
                            )}

                          </div>

                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 5: LABORATORY & ULTRASOUND (🔬 TECHS)
            ======================================================== */}
        {activeTab === 'lab' && (
          <div className="space-y-6">
            
            {/* Lab header */}
            <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 rounded-2xl p-6 text-white border-2 border-emerald-400/40 shadow-sm relative overflow-hidden">
              <div className="absolute right-10 -bottom-6 opacity-10">
                <Beaker className="h-44 w-44" />
              </div>
              
              <div className="max-w-xl">
                <span className="bg-emerald-500/35 text-emerald-100 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-400/30">
                  Laboratoire &amp; Imagerie Échographique B. Medical
                </span>
                <h2 className="text-xl font-extrabold mt-3 text-white flex items-center space-x-2">
                  <Beaker className="h-6 w-6 text-lime-400 shrink-0" />
                  <span>Registre Technique (Analyses &amp; Radio-Écho)</span>
                </h2>
                <p className="text-xs text-emerald-100 mt-1.5 leading-relaxed">
                  Conformément au plateau technique du centre (Laboratoire et Échographie), ce module permet aux laborantins et radiologues d'analyser les requêtes en attente, puis de saisir les rapports médicaux relationnels.
                </p>
              </div>
            </div>

            {/* Saisie résultats form */}
            {selectedLabRequestId !== null && (() => {
              // find request
              let reqObj: any = null;
              patientsList.forEach(p => {
                const found = p.labRequests.find((l: any) => l.id === selectedLabRequestId);
                if (found) reqObj = { ...found, patient: p };
              });

              if (!reqObj) return null;

              return (
                <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 max-w-2xl mx-auto space-y-4 text-xs text-slate-800">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <h3 className="font-bold text-emerald-900 text-sm flex items-center space-x-2">
                      <Beaker className="h-5 w-5 text-emerald-700" />
                      <span>Saisie des Résultats d'Examen</span>
                    </h3>
                    <button onClick={() => setSelectedLabRequestId(null)} className="text-emerald-900 font-bold hover:opacity-75">
                      ✕ Fermer
                    </button>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-emerald-150 space-y-1">
                    <p>Examen prescrit : <strong className="text-emerald-900">{reqObj.testType} ({reqObj.category})</strong></p>
                    <p>Patient : <strong>{reqObj.patient.firstName} {reqObj.patient.lastName}</strong> ({reqObj.patient.phone})</p>
                    <p>Prescrit par : <strong>{reqObj.requestedBy}</strong> le {new Date(reqObj.requestDate).toLocaleDateString('fr-FR')}</p>
                  </div>

                  <form onSubmit={handleSaveLabResult} className="space-y-4">
                    <div>
                      <label className="block text-emerald-900 font-bold mb-1">Rapport de résultats / Conclusions médicales</label>
                      <textarea
                        rows={6}
                        value={labResultText}
                        onChange={(e) => setLabResultText(e.target.value)}
                        placeholder="Saisissez ici les valeurs sanguines ou le compte-rendu d'échographie..."
                        className="w-full bg-white border border-emerald-300 rounded-lg p-3 font-mono text-[11px] leading-relaxed text-slate-800"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-emerald-900 font-bold mb-1">Technicien / Responsable Technique</label>
                        <input
                          type="text"
                          value={labTechnicianName}
                          onChange={(e) => setLabTechnicianName(e.target.value)}
                          className="w-full bg-white border border-emerald-300 rounded-lg p-2.5 text-slate-800"
                          placeholder="Nom du technicien"
                          required
                        />
                      </div>
                      
                      <div className="flex items-end justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setSelectedLabRequestId(null)}
                          className="bg-white hover:bg-emerald-100 text-emerald-900 px-4 py-2.5 rounded-lg font-bold border border-emerald-200"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={isPending}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-lg font-bold shadow-xs"
                        >
                          Enregistrer &amp; Valider ✅
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              );
            })()}

            {/* List of pending and completed requests */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800">
                  Demandes d'Examens Biologiques et d'Échographies
                </h3>
                <span className="text-[10px] text-slate-500">Flux de travail technique</span>
              </div>

              {(() => {
                const allLabs: any[] = [];
                patientsList.forEach(p => {
                  p.labRequests.forEach((l: any) => {
                    allLabs.push({ ...l, patient: p });
                  });
                });

                if (allLabs.length === 0) {
                  return (
                    <div className="p-12 text-center text-slate-400">
                      <Beaker className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                      <p className="font-bold text-slate-600">Aucune demande en cours</p>
                      <p className="text-[10px] mt-1 text-slate-400">Rédigez d'abord une consultation et cochez l'option d'examen pour alimenter ce flux.</p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold uppercase text-[10px]">
                          <th className="p-3">Patiente</th>
                          <th className="p-3">Examen Prescrit</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Prescrit Par</th>
                          <th className="p-3">Statut</th>
                          <th className="p-3">Date</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allLabs.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50/55">
                            <td className="p-3">
                              <strong className="text-slate-900 block">{req.patient.firstName} {req.patient.lastName}</strong>
                              <span className="text-[10px] text-slate-400">{req.patient.phone}</span>
                            </td>
                            <td className="p-3 font-semibold text-teal-850">
                              {req.testType}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                req.category === 'Échographie' 
                                  ? 'bg-violet-100 text-violet-800' 
                                  : 'bg-cyan-100 text-cyan-800'
                              }`}>
                                {req.category}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600">
                              {req.requestedBy}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                req.status === 'Réalisé' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-amber-100 text-amber-800 animate-pulse'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500">
                              {new Date(req.requestDate).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="p-3 text-right">
                              {req.status === 'En attente' ? (
                                <button
                                  onClick={() => {
                                    setSelectedLabRequestId(req.id);
                                    setLabResultText('');
                                    window.scrollTo({ top: 200, behavior: 'smooth' });
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg font-bold text-xs cursor-pointer"
                                >
                                  Saisir Résultats
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedPatientId(req.patient.id);
                                    setActiveTab('patients');
                                  }}
                                  className="text-slate-500 hover:text-slate-800 font-bold underline"
                                >
                                  Voir Rapport
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 6: SPECIALITY APPOINTMENTS (📅 SECRÉTAIRES)
            ======================================================== */}
        {activeTab === 'appointments' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Schedule form */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
                  <Calendar className="h-5 w-5 text-teal-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">
                    Planifier un Rendez-vous
                  </h3>
                </div>

                <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Sélectionner le Patient <span className="text-red-500">*</span></label>
                    <select
                      value={apptPatientId}
                      onChange={(e) => setApptPatientId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                      required
                    >
                      <option value="">-- Choisissez un patient --</option>
                      {patientsList.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.firstName} {p.lastName} ({p.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Spécialité (Sur Rendez-vous) <span className="text-red-500">*</span></label>
                    <select
                      value={apptSpeciality}
                      onChange={(e) => {
                        setApptSpeciality(e.target.value);
                        // Auto-suggest specialized doctor names
                        if (e.target.value === 'Cardiologie') setApptDoctor('Dr. Michel Katenga');
                        else if (e.target.value === 'Pédiatrie') setApptDoctor('Dr. Alain Kasongo');
                        else if (e.target.value === 'Dermatologie') setApptDoctor('Dr. Sandrine Ngoie');
                        else if (e.target.value === 'Chirurgie Pédiatrique') setApptDoctor('Dr. Augustin Ilunga');
                        else if (e.target.value === 'Psychologie Médicale') setApptDoctor('Dr. Rachel Mujinga');
                        else if (e.target.value === 'Gynéco-Obstétrique') setApptDoctor('Dr. Patrick Mwamba');
                        else setApptDoctor('Dr. Médecin Spécialiste');
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                    >
                      <option value="Cardiologie">Cardiologie</option>
                      <option value="Psychologie Médicale">Psychologie Médicale</option>
                      <option value="Pneumologie">Pneumologie</option>
                      <option value="Ophtalmologie">Ophtalmologie</option>
                      <option value="Dermatologie">Dermatologie</option>
                      <option value="Diabétologie">Diabétologie</option>
                      <option value="Urologie">Urologie</option>
                      <option value="Rhumatologie">Rhumatologie</option>
                      <option value="Chirurgie Pédiatrique">Chirurgie Pédiatrique</option>
                      <option value="Néphrologie">Néphrologie</option>
                      <option value="Hématologie">Hématologie</option>
                      <option value="Neuropsychiatrie">Neuropsychiatrie</option>
                      <option value="Stomatologie">Stomatologie</option>
                      <option value="Otorhinolaryngologie">Otorhinolaryngologie</option>
                      <option value="Kinésithérapie">Kinésithérapie</option>
                      <option value="Oncologie">Oncologie</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Praticien Spécialiste Assigné <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={apptDoctor}
                      onChange={(e) => setApptDoctor(e.target.value)}
                      placeholder="e.g. Dr. Michel Katenga"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Date et Heure du Rdv <span className="text-red-500">*</span></label>
                    <input
                      type="datetime-local"
                      value={apptDate}
                      onChange={(e) => setApptDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Motif de consultation spécialisée <span className="text-red-500">*</span></label>
                    <textarea
                      rows={3}
                      value={apptReason}
                      onChange={(e) => setApptReason(e.target.value)}
                      placeholder="e.g. Suivi d'ECG, consultation post-opératoire..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-xl shadow-xs transition"
                  >
                    Confirmer la planification ✅
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Appointments List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-800">
                    Registre Général des Rendez-vous Spécialisés
                  </h3>
                  <span className="text-[10px] text-slate-500">Fil d'attente clinique</span>
                </div>

                {(() => {
                  const allAppts: any[] = [];
                  patientsList.forEach(p => {
                    p.appointments.forEach((a: any) => {
                      allAppts.push({ ...a, patient: p });
                    });
                  });

                  // Sort appointments by date
                  allAppts.sort((x, y) => new Date(x.appointmentDate).getTime() - new Date(y.appointmentDate).getTime());

                  if (allAppts.length === 0) {
                    return (
                      <div className="p-12 text-center text-slate-400">
                        <Calendar className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                        <p className="font-bold text-slate-600">Aucun rendez-vous planifié</p>
                        <p className="text-[10px] mt-1 text-slate-400">Remplissez le formulaire de gauche pour planifier une consultation spécialisée.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="divide-y divide-slate-100">
                      {allAppts.map((appt) => (
                        <div key={appt.id} className="p-4 hover:bg-slate-50/55 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center space-x-2 flex-wrap mb-1">
                              <span className="bg-teal-50 text-teal-800 font-extrabold text-[10px] px-2 py-0.5 rounded border border-teal-250">
                                {appt.speciality}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="font-bold text-slate-900">{appt.patient.firstName} {appt.patient.lastName}</span>
                              <span className="text-slate-400">({appt.patient.phone})</span>
                            </div>
                            
                            <p className="text-slate-700">Médecin : <strong className="text-slate-900">{appt.doctorName}</strong></p>
                            <p className="text-slate-500 mt-0.5">Motif : "{appt.reason}"</p>
                            
                            <p className="text-[10px] text-teal-700 font-bold mt-1.5 flex items-center space-x-1">
                              <Clock className="h-3 w-3 shrink-0" />
                              <span>Prévu le : {new Date(appt.appointmentDate).toLocaleString('fr-FR')}</span>
                            </p>
                          </div>

                          <div className="flex sm:flex-col items-end gap-2 shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              appt.status === 'Planifié' ? 'bg-amber-100 text-amber-800' :
                              appt.status === 'En cours' ? 'bg-purple-100 text-purple-800' :
                              appt.status === 'Terminé' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              Status : {appt.status}
                            </span>

                            {activeRole === 'receptionist' && (
                              <div className="flex gap-1 pt-1 sm:pt-0">
                                {appt.status === 'Planifié' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateAppointment(appt.id, 'En cours')}
                                      className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-bold"
                                    >
                                      En cours
                                    </button>
                                    <button
                                      onClick={() => handleUpdateAppointment(appt.id, 'Terminé')}
                                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold"
                                    >
                                      Terminé
                                    </button>
                                  </>
                                )}
                                {appt.status !== 'Annulé' && appt.status !== 'Terminé' && (
                                  <button
                                    onClick={() => handleUpdateAppointment(appt.id, 'Annulé')}
                                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold"
                                  >
                                    Annuler
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 7: CLINIC DIRECTORY (📍 COORDONNÉES ET SPÉCIALITÉS)
            ======================================================== */}
        {activeTab === 'about' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            
            {/* Presentation Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
              <div className="bg-teal-900 text-white p-6 border-b-4 border-lime-400">
                <h2 className="text-lg font-black tracking-wider uppercase">Polyclinique B. Medical</h2>
                <p className="text-teal-200 text-xs italic mt-1">"Hope for well-being — L'espoir du bien-être"</p>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Contact information */}
                <div className="md:col-span-5 space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide border-b border-slate-200 pb-2">
                    Coordonnées Officielles
                  </h3>

                  <div className="space-y-3 text-slate-700 text-xs">
                    <div className="flex items-start space-x-2.5">
                      <MapPin className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-950 block">Adresse de l'établissement :</strong>
                        <p className="leading-relaxed mt-0.5">
                          N° 123, Avenue Savonnier. Réf. Arrêt de bus Succès. <br />
                          Q/Bel-air, Commune de Kampemba, <br />
                          Ville de Lubumbashi - République Démocratique du Congo
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2.5">
                      <Smartphone className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-950 block">Lignes de contact d'urgence :</strong>
                        <p className="space-y-1 mt-1 font-mono font-semibold">
                          <span className="block text-slate-800">+243 99 49 46 021</span>
                          <span className="block text-slate-800">+243 81 73 51 858</span>
                          <span className="block text-slate-800">+243 84 00 82 917</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2.5">
                      <Mail className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-950 block">Courrier électronique :</strong>
                        <p className="font-mono mt-0.5 text-slate-800">bpharmacylubum@gmail.com</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specialties and Services mapping from flyers */}
                <div className="md:col-span-7 space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide border-b border-slate-200 pb-2">
                    Spécialités Cliniques (Sur Rendez-vous)
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      'Psychologie Médicale', 'Cardiologie', 'Pneumologie', 'Ophtalmologie',
                      'Dermatologie', 'Diabétologie', 'Urologie', 'Rhumatologie',
                      'Chirurgie Pédiatrique', 'Néphrologie', 'Hématologie', 'Neuropsychiatrie',
                      'Stomatologie', 'Otorhinolaryngologie', 'Kinésithérapie', 'Oncologie'
                    ].map((spec, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-200 p-2 rounded-lg font-medium text-slate-800 flex items-center space-x-1.5 hover:bg-teal-50/50 hover:border-teal-200 transition">
                        <div className="h-1.5 w-1.5 rounded-full bg-teal-600"></div>
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide border-b border-slate-200 pb-2 pt-2">
                    Services Permanents
                  </h3>

                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div className="bg-lime-50/55 border border-lime-150 p-2.5 rounded-lg">
                      <strong className="text-teal-950 block text-xs">Médecine Interne &amp; Pédiatrie</strong>
                      <span className="text-[11px] text-slate-500">Prise en charge adulte et pédiatrique 24h/24.</span>
                    </div>
                    <div className="bg-lime-50/55 border border-lime-150 p-2.5 rounded-lg">
                      <strong className="text-teal-950 block text-xs">Gynéco-Obstétrique</strong>
                      <span className="text-[11px] text-slate-500">Maternité de pointe, accouchements et échographies morphologiques.</span>
                    </div>
                    <div className="bg-lime-50/55 border border-lime-150 p-2.5 rounded-lg">
                      <strong className="text-teal-950 block text-xs">Laboratoire &amp; Échographie</strong>
                      <span className="text-[11px] text-slate-500">Bilan biologique complet et radiographie de datation.</span>
                    </div>
                    <div className="bg-lime-50/55 border border-lime-150 p-2.5 rounded-lg">
                      <strong className="text-teal-950 block text-xs">Pharmacie &amp; Soins à domicile</strong>
                      <span className="text-[11px] text-slate-500">Livraison de vos traitements médicaux à Lubumbashi.</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </main>

      {/* ----------------- PATIENT CREATION MODAL ----------------- */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full shadow-2xl overflow-hidden text-xs text-slate-800 max-h-[90vh] flex flex-col">
            
            <div className="bg-teal-900 text-white p-4 font-black text-sm uppercase tracking-wide flex items-center justify-between border-b border-teal-800 shrink-0">
              <span className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-lime-400" />
                <span>Inscription d'un Nouveau Patient</span>
              </span>
              <button 
                onClick={() => setShowAddPatientModal(false)}
                className="text-white hover:opacity-75 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPatientSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Prénom <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={newPatientData.firstName}
                    onChange={(e) => setNewPatientData({ ...newPatientData, firstName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                    placeholder="e.g. Thérèse"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nom de famille <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={newPatientData.lastName}
                    onChange={(e) => setNewPatientData({ ...newPatientData, lastName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                    placeholder="e.g. Mujinga"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Genre <span className="text-red-500">*</span></label>
                  <select
                    value={newPatientData.gender}
                    onChange={(e) => setNewPatientData({ ...newPatientData, gender: e.target.value, isPregnant: e.target.value === 'Féminin' ? newPatientData.isPregnant : false })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  >
                    <option value="Féminin">Féminin</option>
                    <option value="Masculin">Masculin</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Date de naissance <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={newPatientData.birthDate}
                    onChange={(e) => setNewPatientData({ ...newPatientData, birthDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Numéro de Téléphone <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={newPatientData.phone}
                    onChange={(e) => setNewPatientData({ ...newPatientData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                    placeholder="e.g. +243 81 73 51 858"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Courrier Électronique (Email)</label>
                  <input
                    type="email"
                    value={newPatientData.email}
                    onChange={(e) => setNewPatientData({ ...newPatientData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                    placeholder="e.g. therese.mujinga@gmail.com"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Adresse Résidentielle Complète <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={newPatientData.address}
                    onChange={(e) => setNewPatientData({ ...newPatientData, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                    placeholder="N° 123, Avenue des Plaines, Lubumbashi"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Groupe Sanguin</label>
                  <select
                    value={newPatientData.bloodGroup}
                    onChange={(e) => setNewPatientData({ ...newPatientData, bloodGroup: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Allergies connues</label>
                  <input
                    type="text"
                    value={newPatientData.allergies}
                    onChange={(e) => setNewPatientData({ ...newPatientData, allergies: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                    placeholder="e.g. Aspirine, Pénicilline"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Antécédents Pathologiques généraux</label>
                  <textarea
                    rows={2}
                    value={newPatientData.medicalHistory}
                    onChange={(e) => setNewPatientData({ ...newPatientData, medicalHistory: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                    placeholder="Diabète, hypertension, chirurgies passées..."
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nom du contact d'urgence</label>
                  <input
                    type="text"
                    value={newPatientData.emergencyContactName}
                    onChange={(e) => setNewPatientData({ ...newPatientData, emergencyContactName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                    placeholder="e.g. Jean Mujinga (Époux)"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Téléphone d'urgence</label>
                  <input
                    type="text"
                    value={newPatientData.emergencyContactPhone}
                    onChange={(e) => setNewPatientData({ ...newPatientData, emergencyContactPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                    placeholder="e.g. +243 99 49 46 021"
                  />
                </div>

              </div>

              {/* Maternity tracking section inside creation form */}
              {newPatientData.gender === 'Féminin' && (
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 space-y-3 mt-2">
                  <label className="flex items-center space-x-2 cursor-pointer font-bold text-rose-900">
                    <input
                      type="checkbox"
                      checked={newPatientData.isPregnant}
                      onChange={(e) => setNewPatientData({ ...newPatientData, isPregnant: e.target.checked })}
                      className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
                    />
                    <Baby className="h-4 w-4 text-rose-700 shrink-0" />
                    <span>Activer le suivi de grossesse immédiat (Maternité)</span>
                  </label>

                  {newPatientData.isPregnant && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-rose-950 pt-2 border-t border-rose-200/40">
                      <div>
                        <label className="block text-rose-900 font-semibold mb-1">Date Dernières Règles (DDR)</label>
                        <input
                          type="date"
                          value={newPatientData.lastMenstrualPeriod}
                          onChange={(e) => {
                            const ddrVal = e.target.value;
                            let dpaVal = '';
                            if (ddrVal) {
                              const d = new Date(ddrVal);
                              d.setMonth(d.getMonth() + 9);
                              d.setDate(d.getDate() + 7);
                              dpaVal = d.toISOString().split('T')[0];
                            }
                            setNewPatientData({
                              ...newPatientData,
                              lastMenstrualPeriod: ddrVal,
                              estimatedDeliveryDate: dpaVal
                            });
                          }}
                          className="w-full bg-white border border-rose-200 rounded-lg p-2 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-rose-900 font-semibold mb-1">Date Prévue d'Accouchement (DPA)</label>
                        <input
                          type="date"
                          value={newPatientData.estimatedDeliveryDate}
                          onChange={(e) => setNewPatientData({ ...newPatientData, estimatedDeliveryDate: e.target.value })}
                          className="w-full bg-white border border-rose-200 rounded-lg p-2 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-rose-900 font-semibold mb-1">Nombre de Grossesses (Gravida)</label>
                        <input
                          type="number"
                          min={1}
                          value={newPatientData.gravida}
                          onChange={(e) => setNewPatientData({ ...newPatientData, gravida: Number(e.target.value) })}
                          className="w-full bg-white border border-rose-200 rounded-lg p-2 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-rose-900 font-semibold mb-1">Nombre d'Accouchements (Para)</label>
                        <input
                          type="number"
                          min={0}
                          value={newPatientData.para}
                          onChange={(e) => setNewPatientData({ ...newPatientData, para: Number(e.target.value) })}
                          className="w-full bg-white border border-rose-200 rounded-lg p-2 text-slate-800"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Form buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md cursor-pointer"
                >
                  Valider l'inscription du patient
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ----------------- B. MEDICAL GENERAL FOOTER ----------------- */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-white">
                <span className="font-bold text-sm tracking-wider">POLYCLINIQUE B. MEDICAL</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Centre de soins hospitaliers et spécialités sur rendez-vous à Lubumbashi. Maternité active, suivi personnalisé des grossesses, laboratoire d'analyses automatisé, et pharmacie approvisionnée avec service de livraison à domicile.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-white block">Nos Équipes Vous Accompagnent</span>
              <p className="text-[11px]">
                Pour toute urgence ou prise de rendez-vous avec nos cardiologues, pédiatres, gynécologues, dermatologues, diabétologues ou kinésithérapeutes, contactez directement nos lignes de garde.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-white block">Contacts &amp; Garde</span>
              <p className="space-y-1 text-[11px] font-mono">
                <span className="block text-slate-300">📞 +243 99 49 46 021</span>
                <span className="block text-slate-300">📞 +243 81 73 51 858</span>
                <span className="block text-slate-300">📞 +243 84 00 82 917</span>
                <span className="block text-slate-300">✉️ bpharmacylubum@gmail.com</span>
              </p>
            </div>

          </div>

          <div className="mt-6 pt-6 border-t border-slate-800/60 text-center text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} Polyclinique B. Medical - Lubumbashi, Haut-Katanga, RD Congo. Tous droits réservés. Conception d'Application Intégrée des Dossiers Médicaux Relational DB.
          </div>
        </div>
      </footer>

    </div>
  );
}
