const openaiAssistantService = require('../services/openaiAssistantService');
const logger = require('../config/logger');

// Create a new assistant
const createAssistant = async (req, res) => {
    try {
        const { name, instructions, model, tools, fileIds, metadata } = req.body;

        if (!name || !instructions) {
            return res.status(400).json({
                success: false,
                message: "Name and instructions are required"
            });
        }

        const assistant = await openaiAssistantService.createAssistant({
            name,
            instructions,
            model,
            tools,
            fileIds,
            metadata
        });

        res.status(201).json({
            success: true,
            data: assistant
        });
    } catch (error) {
        logger.error(`Error creating assistant: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create assistant"
        });
    }
};

// Get assistant details
const getAssistant = async (req, res) => {
    try {
        const { assistantId } = req.params;

        if (!assistantId) {
            return res.status(400).json({
                success: false,
                message: "Assistant ID is required"
            });
        }

        const assistant = await openaiAssistantService.getAssistant(assistantId);

        res.status(200).json({
            success: true,
            data: assistant
        });
    } catch (error) {
        logger.error(`Error retrieving assistant: ${error.message}`);
        res.status(error.status === 404 ? 404 : 500).json({
            success: false,
            message: error.message || "Failed to retrieve assistant"
        });
    }
};

// Update an assistant
const updateAssistant = async (req, res) => {
    try {
        const { assistantId } = req.params;
        const updates = req.body;

        if (!assistantId) {
            return res.status(400).json({
                success: false,
                message: "Assistant ID is required"
            });
        }

        const assistant = await openaiAssistantService.updateAssistant(assistantId, updates);

        res.status(200).json({
            success: true,
            data: assistant
        });
    } catch (error) {
        logger.error(`Error updating assistant: ${error.message}`);
        res.status(error.status === 404 ? 404 : 500).json({
            success: false,
            message: error.message || "Failed to update assistant"
        });
    }
};

// List all assistants
const listAssistants = async (req, res) => {
    try {
        const { limit, order, after, before } = req.query;

        const assistants = await openaiAssistantService.listAssistants(
            limit ? parseInt(limit) : 20,
            order || "desc",
            after,
            before
        );

        res.status(200).json({
            success: true,
            data: assistants
        });
    } catch (error) {
        logger.error(`Error listing assistants: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to list assistants"
        });
    }
};

// Delete an assistant
const deleteAssistant = async (req, res) => {
    try {
        const { assistantId } = req.params;

        if (!assistantId) {
            return res.status(400).json({
                success: false,
                message: "Assistant ID is required"
            });
        }

        const response = await openaiAssistantService.deleteAssistant(assistantId);

        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        logger.error(`Error deleting assistant: ${error.message}`);
        res.status(error.status === 404 ? 404 : 500).json({
            success: false,
            message: error.message || "Failed to delete assistant"
        });
    }
};

// Add a file to an assistant
const addFileToAssistant = async (req, res) => {
    try {
        const { assistantId } = req.params;
        const { fileId } = req.body;

        if (!assistantId || !fileId) {
            return res.status(400).json({
                success: false,
                message: "Assistant ID and File ID are required"
            });
        }

        const file = await openaiAssistantService.addFileToAssistant(assistantId, fileId);

        res.status(200).json({
            success: true,
            data: file
        });
    } catch (error) {
        logger.error(`Error adding file to assistant: ${error.message}`);
        res.status(error.status === 404 ? 404 : 500).json({
            success: false,
            message: error.message || "Failed to add file to assistant"
        });
    }
};

// Remove a file from an assistant
const removeFileFromAssistant = async (req, res) => {
    try {
        const { assistantId, fileId } = req.params;

        if (!assistantId || !fileId) {
            return res.status(400).json({
                success: false,
                message: "Assistant ID and File ID are required"
            });
        }

        const response = await openaiAssistantService.removeFileFromAssistant(assistantId, fileId);

        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        logger.error(`Error removing file from assistant: ${error.message}`);
        res.status(error.status === 404 ? 404 : 500).json({
            success: false,
            message: error.message || "Failed to remove file from assistant"
        });
    }
};

// List files for an assistant
const listAssistantFiles = async (req, res) => {
    try {
        const { assistantId } = req.params;
        const { limit, order, after, before } = req.query;

        if (!assistantId) {
            return res.status(400).json({
                success: false,
                message: "Assistant ID is required"
            });
        }

        const files = await openaiAssistantService.listAssistantFiles(
            assistantId,
            limit ? parseInt(limit) : 20,
            order || "desc",
            after,
            before
        );

        res.status(200).json({
            success: true,
            data: files
        });
    } catch (error) {
        logger.error(`Error listing assistant files: ${error.message}`);
        res.status(error.status === 404 ? 404 : 500).json({
            success: false,
            message: error.message || "Failed to list assistant files"
        });
    }
};

// Upload a file for assistant use
const uploadFile = async (req, res) => {
    try {
        // This would typically be handled by middleware like multer
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const filePath = req.file.path;
        const purpose = req.body.purpose || "assistants";

        const file = await openaiAssistantService.uploadFile(filePath, purpose);

        res.status(201).json({
            success: true,
            data: file
        });
    } catch (error) {
        logger.error(`Error uploading file: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to upload file"
        });
    }
};

module.exports = {
    createAssistant,
    getAssistant,
    updateAssistant,
    listAssistants,
    deleteAssistant,
    addFileToAssistant,
    removeFileFromAssistant,
    listAssistantFiles,
    uploadFile
}; 