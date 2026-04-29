import multer from "multer";

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        console.log("File is", file);
        cb(null, Date.now() + "-" + file.originalname);
    }

})

export const upload = multer({ storage });