const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

router.post('/', loanController.createLoan);
router.get('/', loanController.getLoansByMonth);
router.get('/employee/:employeeId', loanController.getLoansByEmployee);
router.get('/employee/:employeeId/month', loanController.getLoansByEmployeeAndMonth);
router.put('/:id', loanController.updateLoanStatus);
router.get('/report', loanController.getReport);
router.put('/lunas/:employeeId', loanController.markLoansPaid);

module.exports = router;