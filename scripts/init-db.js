const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Patient = require('../models/Patient');
const Practitioner = require('../models/Practitioner');
const Therapy = require('../models/Therapy');
const Appointment = require('../models/Appointment');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/panchakarma_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  initializeDatabase();
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database...');

    // Clear existing data
    await clearDatabase();

    // Create sample data
    await createSampleData();

    console.log('✅ Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  console.log('🧹 Clearing existing data...');
  
  await User.deleteMany({});
  await Patient.deleteMany({});
  await Practitioner.deleteMany({});
  await Therapy.deleteMany({});
  await Appointment.deleteMany({});
  await Feedback.deleteMany({});
  await Notification.deleteMany({});
  
  console.log('✅ Database cleared');
}

async function createSampleData() {
  console.log('📝 Creating sample data...');

  // Create admin user
  const adminUser = new User({
    email: 'admin@panchakarmapro.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    phone: '+1-555-0001'
  });
  await adminUser.save();
  console.log('✅ Admin user created');

  // Create sample practitioners
  const practitioner1 = new User({
    email: 'dr.priya@panchakarmapro.com',
    password: 'practitioner123',
    firstName: 'Dr. Priya',
    lastName: 'Sharma',
    role: 'practitioner',
    phone: '+1-555-0002'
  });
  await practitioner1.save();

  const practitioner2 = new User({
    email: 'dr.raj@panchakarmapro.com',
    password: 'practitioner123',
    firstName: 'Dr. Raj',
    lastName: 'Patel',
    role: 'practitioner',
    phone: '+1-555-0003'
  });
  await practitioner2.save();

  // Create practitioner profiles
  const practitionerProfile1 = new Practitioner({
    userId: practitioner1._id,
    licenseNumber: 'PK001',
    specialization: ['abhyanga', 'shirodhara', 'basti'],
    experience: 8,
    education: [
      {
        degree: 'BAMS',
        institution: 'Ayurveda University',
        year: 2015,
        specialization: 'Panchakarma'
      }
    ],
    bio: 'Experienced Panchakarma specialist with 8 years of practice in traditional Ayurveda treatments.',
    languages: ['English', 'Hindi', 'Sanskrit'],
    consultationFee: 150,
    availability: {
      monday: { start: '09:00', end: '17:00', isAvailable: true },
      tuesday: { start: '09:00', end: '17:00', isAvailable: true },
      wednesday: { start: '09:00', end: '17:00', isAvailable: true },
      thursday: { start: '09:00', end: '17:00', isAvailable: true },
      friday: { start: '09:00', end: '17:00', isAvailable: true },
      saturday: { start: '10:00', end: '14:00', isAvailable: true }
    }
  });
  await practitionerProfile1.save();

  const practitionerProfile2 = new Practitioner({
    userId: practitioner2._id,
    licenseNumber: 'PK002',
    specialization: ['nasya', 'virechana', 'general'],
    experience: 12,
    education: [
      {
        degree: 'MD Ayurveda',
        institution: 'National Institute of Ayurveda',
        year: 2011,
        specialization: 'Panchakarma'
      }
    ],
    bio: 'Senior Ayurveda physician specializing in detoxification and rejuvenation therapies.',
    languages: ['English', 'Hindi', 'Gujarati'],
    consultationFee: 200,
    availability: {
      monday: { start: '10:00', end: '18:00', isAvailable: true },
      tuesday: { start: '10:00', end: '18:00', isAvailable: true },
      wednesday: { start: '10:00', end: '18:00', isAvailable: true },
      thursday: { start: '10:00', end: '18:00', isAvailable: true },
      friday: { start: '10:00', end: '18:00', isAvailable: true }
    }
  });
  await practitionerProfile2.save();

  console.log('✅ Practitioners created');

  // Create sample patients
  const patient1 = new User({
    email: 'sarah.johnson@email.com',
    password: 'patient123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'patient',
    phone: '+1-555-1001'
  });
  await patient1.save();

  const patient2 = new User({
    email: 'michael.chen@email.com',
    password: 'patient123',
    firstName: 'Michael',
    lastName: 'Chen',
    role: 'patient',
    phone: '+1-555-1002'
  });
  await patient2.save();

  const patient3 = new User({
    email: 'emily.rodriguez@email.com',
    password: 'patient123',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    role: 'patient',
    phone: '+1-555-1003'
  });
  await patient3.save();

  // Create patient profiles
  const patientProfile1 = new Patient({
    userId: patient1._id,
    dateOfBirth: new Date('1985-03-15'),
    gender: 'female',
    address: {
      street: '123 Wellness St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA'
    },
    emergencyContact: {
      name: 'John Johnson',
      relationship: 'Spouse',
      phone: '+1-555-1004',
      email: 'john.johnson@email.com'
    },
    medicalHistory: {
      allergies: ['Peanuts'],
      currentMedications: ['Multivitamin'],
      chronicConditions: ['Stress'],
      bloodType: 'A+'
    },
    panchakarmaHistory: {
      currentTherapy: {
        type: 'abhyanga',
        startDate: new Date(),
        expectedDuration: 8,
        sessionsCompleted: 6,
        totalSessions: 8
      }
    },
    healthGoals: ['Stress reduction', 'Better sleep', 'Overall wellness'],
    assignedPractitioner: practitionerProfile1._id
  });
  await patientProfile1.save();

  const patientProfile2 = new Patient({
    userId: patient2._id,
    dateOfBirth: new Date('1978-07-22'),
    gender: 'male',
    address: {
      street: '456 Health Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      country: 'USA'
    },
    medicalHistory: {
      allergies: [],
      currentMedications: [],
      chronicConditions: ['Digestive issues'],
      bloodType: 'O+'
    },
    panchakarmaHistory: {
      currentTherapy: {
        type: 'shirodhara',
        startDate: new Date(),
        expectedDuration: 6,
        sessionsCompleted: 3,
        totalSessions: 6
      }
    },
    healthGoals: ['Digestive health', 'Mental clarity'],
    assignedPractitioner: practitionerProfile1._id
  });
  await patientProfile2.save();

  const patientProfile3 = new Patient({
    userId: patient3._id,
    dateOfBirth: new Date('1990-11-08'),
    gender: 'female',
    address: {
      street: '789 Balance Blvd',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94104',
      country: 'USA'
    },
    medicalHistory: {
      allergies: ['Dairy'],
      currentMedications: [],
      chronicConditions: [],
      bloodType: 'B+'
    },
    panchakarmaHistory: {
      currentTherapy: {
        type: 'basti',
        startDate: new Date(),
        expectedDuration: 8,
        sessionsCompleted: 2,
        totalSessions: 8
      }
    },
    healthGoals: ['Detoxification', 'Energy improvement'],
    assignedPractitioner: practitionerProfile2._id
  });
  await patientProfile3.save();

  console.log('✅ Patients created');

  // Create sample therapies
  const therapies = [
    {
      name: 'Abhyanga (Oil Massage)',
      type: 'abhyanga',
      description: 'Traditional Ayurvedic full-body oil massage using warm medicated oils to promote relaxation, improve circulation, and balance doshas.',
      benefits: ['Stress reduction', 'Improved circulation', 'Better sleep', 'Muscle relaxation', 'Skin nourishment'],
      contraindications: ['Fever', 'Acute inflammation', 'Skin infections'],
      duration: 60,
      cost: 120,
      preparationInstructions: 'Avoid heavy meals 2 hours before treatment. Wear comfortable clothing.',
      postTreatmentInstructions: 'Rest for 30 minutes. Avoid cold water for 2 hours. Drink warm water.',
      requiredEquipment: ['Massage table', 'Warm oil', 'Towels'],
      requiredOils: ['Sesame oil', 'Coconut oil', 'Medicated oils'],
      difficulty: 'beginner'
    },
    {
      name: 'Shirodhara (Oil Pouring)',
      type: 'shirodhara',
      description: 'Continuous pouring of warm medicated oil on the forehead in a rhythmic pattern to calm the mind and nervous system.',
      benefits: ['Mental relaxation', 'Improved sleep', 'Stress relief', 'Headache relief', 'Mental clarity'],
      contraindications: ['High blood pressure', 'Recent head injury', 'Severe anxiety'],
      duration: 45,
      cost: 100,
      preparationInstructions: 'Avoid caffeine 4 hours before. Empty bladder before treatment.',
      postTreatmentInstructions: 'Rest for 1 hour. Avoid bright lights and loud noises.',
      requiredEquipment: ['Shirodhara apparatus', 'Warm oil', 'Head support'],
      requiredOils: ['Brahmi oil', 'Sesame oil', 'Medicated oils'],
      difficulty: 'intermediate'
    },
    {
      name: 'Basti (Enema Therapy)',
      type: 'basti',
      description: 'Medicated enema therapy using herbal decoctions and oils to cleanse the colon and balance vata dosha.',
      benefits: ['Colon cleansing', 'Vata balance', 'Digestive health', 'Detoxification', 'Pain relief'],
      contraindications: ['Acute diarrhea', 'Rectal bleeding', 'Pregnancy', 'Severe constipation'],
      duration: 30,
      cost: 80,
      preparationInstructions: 'Follow specific diet 3 days before. Empty bowels completely.',
      postTreatmentInstructions: 'Rest for 2 hours. Follow prescribed diet. Avoid cold foods.',
      requiredEquipment: ['Basti apparatus', 'Herbal decoctions', 'Oils'],
      requiredOils: ['Sesame oil', 'Castor oil', 'Medicated oils'],
      difficulty: 'advanced'
    }
  ];

  for (const therapyData of therapies) {
    const therapy = new Therapy(therapyData);
    await therapy.save();
  }

  console.log('✅ Therapies created');

  // Create sample appointments
  const appointments = [
    {
      patient: patientProfile1._id,
      practitioner: practitionerProfile1._id,
      therapyType: 'abhyanga',
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      startTime: '10:00',
      endTime: '11:00',
      duration: 60,
      cost: 120,
      status: 'confirmed',
      notes: 'Regular maintenance session',
      preSessionInstructions: 'Avoid heavy meals 2 hours before',
      postSessionInstructions: 'Rest for 30 minutes after treatment'
    },
    {
      patient: patientProfile2._id,
      practitioner: practitionerProfile1._id,
      therapyType: 'shirodhara',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      startTime: '14:00',
      endTime: '14:45',
      duration: 45,
      cost: 100,
      status: 'scheduled',
      notes: 'Stress management session',
      preSessionInstructions: 'Avoid caffeine 4 hours before',
      postSessionInstructions: 'Rest for 1 hour in quiet environment'
    },
    {
      patient: patientProfile3._id,
      practitioner: practitionerProfile2._id,
      therapyType: 'basti',
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
      startTime: '09:00',
      endTime: '09:30',
      duration: 30,
      cost: 80,
      status: 'scheduled',
      notes: 'Detoxification therapy',
      preSessionInstructions: 'Follow prescribed diet for 3 days',
      postSessionInstructions: 'Rest for 2 hours, follow prescribed diet'
    }
  ];

  for (const appointmentData of appointments) {
    const appointment = new Appointment(appointmentData);
    await appointment.save();
  }

  console.log('✅ Appointments created');

  // Create sample feedback
  const feedback1 = new Feedback({
    patient: patientProfile1._id,
    practitioner: practitionerProfile1._id,
    appointment: (await Appointment.findOne({ patient: patientProfile1._id }))._id,
    therapyType: 'abhyanga',
    rating: {
      overall: 5,
      practitioner: 5,
      facility: 4,
      cleanliness: 5,
      value: 4
    },
    comments: 'Excellent session! The therapist was very professional and the treatment was very relaxing.',
    symptoms: {
      before: ['Stress', 'Tension'],
      after: ['Relaxed', 'Calm'],
      improvement: 'significant'
    },
    wouldRecommend: true,
    status: 'approved'
  });
  await feedback1.save();

  console.log('✅ Sample feedback created');

  // Create sample notifications
  const notifications = [
    {
      recipient: patient1._id,
      type: 'appointment_reminder',
      title: 'Appointment Reminder',
      message: 'Your Abhyanga session is scheduled for tomorrow at 10:00 AM. Please arrive 15 minutes early.',
      priority: 'high',
      channels: [{ type: 'email', sent: true, sentAt: new Date() }],
      data: {
        appointmentId: (await Appointment.findOne({ patient: patientProfile1._id }))._id,
        therapyType: 'abhyanga',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    },
    {
      recipient: patient2._id,
      type: 'feedback_request',
      title: 'Feedback Request',
      message: 'Please share your experience from yesterday\'s Shirodhara session.',
      priority: 'medium',
      channels: [{ type: 'in-app', sent: true, sentAt: new Date() }],
      data: {
        therapyType: 'shirodhara'
      }
    }
  ];

  for (const notificationData of notifications) {
    const notification = new Notification(notificationData);
    await notification.save();
  }

  console.log('✅ Notifications created');

  // Update practitioner patient lists
  practitionerProfile1.patients = [patientProfile1._id, patientProfile2._id];
  practitionerProfile2.patients = [patientProfile3._id];
  await practitionerProfile1.save();
  await practitionerProfile2.save();

  console.log('✅ Database initialization completed!');
  console.log('\n📋 Sample Data Created:');
  console.log('👤 Admin User: admin@panchakarmapro.com / admin123');
  console.log('👨‍⚕️ Practitioners: dr.priya@panchakarmapro.com / practitioner123');
  console.log('👨‍⚕️ Practitioners: dr.raj@panchakarmapro.com / practitioner123');
  console.log('👥 Patients: sarah.johnson@email.com / patient123');
  console.log('👥 Patients: michael.chen@email.com / patient123');
  console.log('👥 Patients: emily.rodriguez@email.com / patient123');
}
