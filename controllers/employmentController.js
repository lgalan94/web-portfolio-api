const Employment = require('../models/Employment.js');

// 🟢 CREATE
module.exports.Create = async (req, res) => {
  const { title, company, location, startDate, endDate, description } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).send({ message: "Title is required." });
  }

  if (!company || company.trim() === "") {
    return res.status(400).send({ message: "Company is required." });
  }

  if (!startDate || startDate.trim() === "") {
    return res.status(400).send({ message: "Start date is required." });
  }

  if (!description || !Array.isArray(description) || description.length === 0) {
    return res.status(400).send({ message: "Description must be a non-empty array." });
  }

  try {
    const newExperience = new Employment({
      title: title.trim(),
      company: company.trim(),
      location: location?.trim() || 'Remote',
      startDate: startDate.trim(),
      endDate: endDate?.trim() || 'Present',
      description
    });

    const savedData = await newExperience.save();
    return res.status(201).send(savedData);
  } catch (error) {
    console.error("Error adding work experience:", error);
    return res.status(500).send({
      message: "An internal server error occurred.",
      error: error.message
    });
  }
};

// 🔵 READ ALL
module.exports.GetAll = async (req, res) => {
  try {
    const experiences = await Employment.find().sort({ createdOn: -1 });
    return res.status(200).send(experiences);
  } catch (error) {
    console.error("Error fetching work experiences:", error);
    return res.status(500).send({
      message: "An internal server error occurred.",
      error: error.message
    });
  }
};

// 🟣 READ ONE
module.exports.GetOne = async (req, res) => {
  try {
    const experience = await Employment.findById(req.params.id);

    if (!experience) {
      return res.status(404).send({ message: "Work experience not found." });
    }

    return res.status(200).send(experience);
  } catch (error) {
    console.error("Error fetching work experience:", error);
    return res.status(500).send({
      message: "An internal server error occurred.",
      error: error.message
    });
  }
};

// 🟠 UPDATE
module.exports.Update = async (req, res) => {
  const { id } = req.params;
  const { title, company, location, startDate, endDate, description } = req.body;

  try {
    const updatedExperience = await Employment.findByIdAndUpdate(
      id,
      {
        ...(title && { title: title.trim() }),
        ...(company && { company: company.trim() }),
        ...(location && { location: location.trim() }),
        ...(startDate && { startDate: startDate.trim() }),
        ...(endDate && { endDate: endDate.trim() }),
        ...(description && { description })
      },
      { new: true, runValidators: true }
    );

    if (!updatedExperience) {
      return res.status(404).send({ message: "Work experience not found." });
    }

    return res.status(200).send(updatedExperience);
  } catch (error) {
    console.error("Error updating work experience:", error);
    return res.status(500).send({
      message: "An internal server error occurred.",
      error: error.message
    });
  }
};

// 🔴 DELETE
module.exports.Delete = async (req, res) => {
  try {
    const deletedExperience = await Employment.findByIdAndDelete(req.params.id);

    if (!deletedExperience) {
      return res.status(404).send({ message: "Work experience not found." });
    }

    return res.status(200).send({ message: "Work experience deleted successfully." });
  } catch (error) {
    console.error("Error deleting work experience:", error);
    return res.status(500).send({
      message: "An internal server error occurred.",
      error: error.message
    });
  }
};
