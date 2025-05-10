// src/routes/openaiAssistantRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const assistantController = require('../controllers/openaiAssistantController');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit (adjust as needed)
});

// Assistant management routes
router.post('/assistants', assistantController.createAssistant);
router.get('/assistants', assistantController.listAssistants);
router.get('/assistants/:assistantId', assistantController.getAssistant);
router.put('/assistants/:assistantId', assistantController.updateAssistant);
router.delete('/assistants/:assistantId', assistantController.deleteAssistant);

// Assistant files routes
router.post('/assistants/:assistantId/files', assistantController.addFileToAssistant);
router.get('/assistants/:assistantId/files', assistantController.listAssistantFiles);
router.delete('/assistants/:assistantId/files/:fileId', assistantController.removeFileFromAssistant);

// File upload route
router.post('/files', upload.single('file'), assistantController.uploadFile);

module.exports = router; 