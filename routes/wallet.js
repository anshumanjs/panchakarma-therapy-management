const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction'); // Import Transaction model

const router = express.Router();

// @route   GET /api/wallet/balance
// @desc    Get user's wallet balance
// @access  Private
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        balance: user.walletBalance || 0,
        currency: 'INR'
      }
    });
  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching wallet balance',
      error: error.message
    });
  }
});

// @route   POST /api/wallet/add-funds
// @desc    Add funds to user's wallet
// @access  Private
router.post('/add-funds', auth, [
  body('amount').isFloat({ min: 100, max: 50000 }),
  body('paymentMethod').isIn(['card', 'upi', 'netbanking']),
  body('transactionId').notEmpty()
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

    const { amount, paymentMethod, transactionId } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update wallet balance
    const currentBalance = user.walletBalance || 0;
    user.walletBalance = currentBalance + amount;
    await user.save();

    // Create a transaction record
    const newTransaction = new Transaction({
      userId: user._id,
      type: 'credit',
      amount,
      description: 'Wallet top-up',
      status: 'completed',
      paymentMethod,
      transactionId
    });
    await newTransaction.save();

    // TODO: In a real application, you would:
    // 1. Verify the payment with the payment gateway
    // 2. Send confirmation email/SMS

    res.json({
      success: true,
      message: 'Funds added successfully',
      data: {
        newBalance: user.walletBalance,
        amountAdded: amount,
        transactionId
      }
    });
  } catch (error) {
    console.error('Add funds error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding funds',
      error: error.message
    });
  }
});

// @route   POST /api/wallet/deduct
// @desc    Deduct amount from user's wallet
// @access  Private
router.post('/deduct', auth, [
  body('amount').isFloat({ min: 1 }),
  body('reason').notEmpty()
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

    const { amount, reason } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const currentBalance = user.walletBalance || 0;
    if (currentBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }

    // Update wallet balance
    user.walletBalance = currentBalance - amount;
    await user.save();

    // Create a transaction record
    const newTransaction = new Transaction({
      userId: user._id,
      type: 'debit',
      amount,
      description: reason,
      status: 'completed',
      paymentMethod: 'wallet' // Assuming deduction is from wallet
    });
    await newTransaction.save();

    res.json({
      success: true,
      message: 'Amount deducted successfully',
      data: {
        newBalance: user.walletBalance,
        amountDeducted: amount,
        reason
      }
    });
  } catch (error) {
    console.error('Deduct funds error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deducting funds',
      error: error.message
    });
  }
});

// @route   GET /api/wallet/transactions
// @desc    Get user's wallet transaction history
// @access  Private
router.get('/transactions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching transactions',
      error: error.message
    });
  }
});

module.exports = router;
