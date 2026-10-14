const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'QuickCart API v1' });
});

module.exports = router;
