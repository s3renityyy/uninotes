import fileModel from "../model/fileModel.js";

const uploadTryhackmeController = async (req, res) => {
  try {
    const fileObject = {
      path: req.file.path,
      name: req.file.originalname,
    };
    const file = await fileModel.create(fileObject);
    return res
      .status(200)
      .json({ path: `http://localhost:9000/files/${file._id}` });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export default uploadTryhackmeController;
