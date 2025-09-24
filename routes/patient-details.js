const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth'); // Use auth from middleware/auth
const PatientDetail = require('../models/PatientDetail');
const User = require('../models/User');
const mongoose = require('mongoose'); // Import mongoose for ObjectId

const router = express.Router();

// @route   GET /api/patient-details/:patientId
// @desc    Get patient details
// @access  Private (Patient or Practitioner)
router.get('/:patientId', auth, authorize('patient', 'practitioner', 'admin'), async (req, res) => {
  try {
    const { patientId } = req.params;
    const user = req.user;

    // Check if user has access to this patient's details
    if (user.role === 'patient' && user._id.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own details.'
      });
    }

    const patientDetails = await PatientDetail.findOne({ patientId })
      .populate('patientId', 'firstName lastName email phone')
      .populate('problems.practitionerNotes.practitionerId', 'firstName lastName')
      .populate('improvements.recordedBy', 'firstName lastName')
      .populate('notes.practitionerId', 'firstName lastName');

    if (!patientDetails) {
      return res.status(404).json({
        success: false,
        message: 'Patient details not found'
      });
    }

    res.json({
      success: true,
      data: patientDetails
    });
  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching patient details',
      error: error.message
    });
  }
});

// @route   POST /api/patient-details
// @desc    Create or update patient details
// @access  Private (Patient or Practitioner)
router.post('/', auth, authorize('patient', 'practitioner', 'admin'), [
  body('patientId').isMongoId(),
  body('personalInfo.dateOfBirth').optional().isISO8601(),
  body('personalInfo.gender').optional().isIn(['male', 'female', 'other']),
  body('personalInfo.bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  body('medicalHistory.allergies').optional().isArray(),
  body('medicalHistory.currentMedications').optional().isArray(),
  body('medicalHistory.chronicConditions').optional().isArray(),
  body('medicalHistory.previousSurgeries').optional().isArray(),
  body('medicalHistory.familyHistory').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { patientId, personalInfo, medicalHistory, doshaAssessment, therapyPlan, vitalSigns, notes } = req.body;
    const user = req.user;

    // Check if user has permission to update this patient's details
    if (user.role === 'patient' && user._id.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own details.'
      });
    }

    let patientDetail = await PatientDetail.findOne({ patientId });

    if (patientDetail) {
      // Update existing details
      if (personalInfo) patientDetail.personalInfo = { ...patientDetail.personalInfo, ...personalInfo };
      if (medicalHistory) patientDetail.medicalHistory = { ...patientDetail.medicalHistory, ...medicalHistory };
      if (doshaAssessment) patientDetail.doshaAssessment = { ...patientDetail.doshaAssessment, ...doshaAssessment };
      if (therapyPlan) patientDetail.therapyPlan = { ...patientDetail.therapyPlan, ...therapyPlan };
      if (vitalSigns) patientDetail.vitalSigns.push(vitalSigns); // Add new vital signs entry
      if (notes) patientDetail.notes.push(notes); // Add new note
    } else {
      // Create new details
      patientDetail = new PatientDetail({
        patientId,
        personalInfo,
        medicalHistory,
        doshaAssessment,
        therapyPlan,
        vitalSigns: vitalSigns ? [vitalSigns] : [],
        notes: notes ? [notes] : []
      });
    }

    await patientDetail.save();

    res.status(200).json({
      success: true,
      message: 'Patient details saved successfully',
      data: patientDetail
    });
  } catch (error) {
    console.error('Save patient details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error saving patient details',
      error: error.message
    });
  }
});

// @route   POST /api/patient-details/:patientId/problems
// @desc    Add a new problem to patient details
// @access  Private (practitioners, admins)
router.post('/:patientId/problems', auth, authorize('practitioner', 'admin'), [
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('severity').isIn(['mild', 'moderate', 'severe']).optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { title, description, severity } = req.body;
    const patientDetail = await PatientDetail.findOne({ patientId: req.params.patientId });

    if (!patientDetail) {
      return res.status(404).json({
        success: false,
        message: 'Patient details not found'
      });
    }

    const newProblem = {
      problemId: new mongoose.Types.ObjectId(), // Generate a new ObjectId for the problem
      title,
      description,
      severity,
      practitionerNotes: [{
        note: `Problem added by ${req.user.firstName} ${req.user.lastName}`,
        practitionerId: req.user._id
      }]
    };

    patientDetail.problems.push(newProblem);
    await patientDetail.save();

    res.status(201).json({
      success: true,
      message: 'Problem added successfully',
      data: newProblem
    });
  } catch (error) {
    console.error('Add problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding problem',
      error: error.message
    });
  }
});

// @route   POST /api/patient-details/:patientId/improvements
// @desc    Add a new improvement to patient details
// @access  Private (practitioners, admins)
router.post('/:patientId/improvements', auth, authorize('practitioner', 'admin'), [
  body('problemId').optional().isString(), // Make problemId optional
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('improvementPercentage').isInt({ min: 0, max: 100 }),
  body('measurementType').isIn(['pain_scale', 'mobility', 'energy_level', 'sleep_quality', 'mood', 'other']),
  body('recordedBy').isMongoId() // Ensure recordedBy is a valid MongoId
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { problemId, title, description, improvementPercentage, measurementType, beforeValue, afterValue, unit, notes, recordedBy } = req.body;
    const patientDetail = await PatientDetail.findOne({ patientId: req.params.patientId });

    if (!patientDetail) {
      return res.status(404).json({
        success: false,
        message: 'Patient details not found'
      });
    }

    const newImprovement = {
      improvementId: new mongoose.Types.ObjectId(), // Generate a new ObjectId for the improvement
      problemId: problemId || 'N/A', // Allow problemId to be optional or 'N/A' if not directly linked
      title,
      description,
      improvementPercentage,
      measurementType,
      beforeValue,
      afterValue,
      unit,
      notes,
      recordedBy: recordedBy // Use the recordedBy from the request body
    };

    patientDetail.improvements.push(newImprovement);
    await patientDetail.save();

    res.status(201).json({
      success: true,
      message: 'Improvement added successfully',
      data: newImprovement
    });
  } catch (error) {
    console.error('Add improvement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding improvement',
      error: error.message
    });
  }
});

// @route   POST /api/patient-details/:patientId/vital-signs
// @desc    Add new vital signs to patient details
// @access  Private (practitioners, admins)
router.post('/:patientId/vital-signs', auth, authorize('practitioner', 'admin'), [
  body('bloodPressure.systolic').isInt({ min: 0 }).optional(),
  body('bloodPressure.diastolic').isInt({ min: 0 }).optional(),
  body('heartRate').isInt({ min: 0 }).optional(),
  body('temperature').isFloat({ min: 0 }).optional(),
  body('weight').isFloat({ min: 0 }).optional(),
  body('height').isFloat({ min: 0 }).optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const vitalSignsData = {
      ...req.body,
      recordedBy: req.user._id,
      date: new Date()
    };

    const patientDetail = await PatientDetail.findOne({ patientId: req.params.patientId });

    if (!patientDetail) {
      return res.status(404).json({
        success: false,
        message: 'Patient details not found'
      });
    }

    patientDetail.vitalSigns.push(vitalSignsData);
    await patientDetail.save();

    res.status(201).json({
      success: true,
      message: 'Vital signs added successfully',
      data: vitalSignsData
    });
  } catch (error) {
    console.error('Add vital signs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding vital signs',
      error: error.message
    });
  }
});

// @route   POST /api/patient-details/:patientId/notes
// @desc    Add a new note to patient details
// @access  Private (practitioners, admins)
router.post('/:patientId/notes', auth, authorize('practitioner', 'admin'), [
  body('note').notEmpty(),
  body('category').isIn(['general', 'symptom', 'treatment', 'progress', 'concern']).optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { note, category, isPrivate } = req.body;
    const patientDetail = await PatientDetail.findOne({ patientId: req.params.patientId });

    if (!patientDetail) {
      return res.status(404).json({
        success: false,
        message: 'Patient details not found'
      });
    }

    const newNote = {
      note,
      category,
      isPrivate,
      practitionerId: req.user._id,
      timestamp: new Date()
    };

    patientDetail.notes.push(newNote);
    await patientDetail.save();

    res.status(201).json({
      success: true,
      message: 'Note added successfully',
      data: newNote
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding note',
      error: error.message
    });
  }
});

module.exports = router;
