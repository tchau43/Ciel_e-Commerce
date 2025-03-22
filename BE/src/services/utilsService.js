const uploadImageService = (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    res.json({
        imageUrl: `http://localhost:8080/images/product/${req.file.filename}`
    });
}


module.exports = { uploadImageService }