import multer from 'multer';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${sanitizedName}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new Error('Only image uploads are allowed.'), false);
    return;
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

export const uploadSingleImage = upload.single('image');
export const uploadMultipleImages = upload.array('images', 10);
export default upload;
