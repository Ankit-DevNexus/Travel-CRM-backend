import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, './public/temp'); // folder to save images
    },
    filename: function (req, file, cb) {
    cb(null, Date.now() + '-' +file.originalname);
    }
});

const svgfileFilter = (req, file, cb) => {
    // console.log("File Upload Attempt:", file.originalname);
    // console.log("MIME TYPE:", file.mimetype);
    if(file.mimetype === 'image/svg+xml'){
        cb(null, true);
    } else {
        cb(new Error('Only Svg files are allowed'), false);
    }
};

const memoryStorage = multer.memoryStorage();

const excelFileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".xlsx" || ext === ".xls") {
        cb(null, true);
    } else {
        cb(new Error("Only Excel files (.xlsx, .xls) are allowed"), false);
    }
};

const svgStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/temp');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

export const upload = multer({ storage: storage });
export const svgUpload = multer({storage: svgStorage, fileFilter: svgfileFilter});
export const excelUpload = multer({
    storage: memoryStorage,
    fileFilter: excelFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Optional: 5MB limit
});