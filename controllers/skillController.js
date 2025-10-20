const Skills = require('../models/Skills.js');

module.exports.AddSkill = async (req, res) => {
    const { name, icon, category } = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).send({ message: "Skill name is required." });
    }

    try {
        const existingSkill = await Skills.findOne({ name: name.toUpperCase().trim() });
        if (existingSkill) {
            return res.status(409).send({ 
                message: "Skill already exists.",
                skill: existingSkill 
            });
        }

        let newSkill = new Skills({
            name: name.toUpperCase().trim(),
            icon: icon.trim(),
            category: category.trim()
        });

        const savedSkill = await newSkill.save();

        return res.status(201).send({
            message: "Skill added successfully.",
            skill: savedSkill
        });

    } catch (error) {
        // 6. Generic Server Error
        console.error("Error adding skill:", error);
        return res.status(500).send({ 
            message: "An internal server error occurred.",
            error: error.message 
        });
    }
};

module.exports.RetrieveSkills = async (req, res) => {
    try {
        const result = await Skills.find({});
        return res.status(200).json(result); 

    } catch (error) {
        console.error("Error retrieving skills:", error);
        return res.status(500).send({ 
            message: "An internal server error occurred during skill retrieval.",
            error: error.message 
        });
    }
};

module.exports.DeleteSkill = async (req, res) => {
    const skillId = req.params.id;

    if (!skillId) {
        return res.status(400).send({ message: "Skill ID is required for deletion." });
    }

    try {
        const deletedSkill = await Skills.findByIdAndDelete(skillId);

        if (!deletedSkill) {
            return res.status(404).send({ message: `Skill with ID ${skillId} not found.` });
        }

        return res.status(200).send({
            message: "Skill deleted successfully. 🗑️",
            skill: deletedSkill 
        });

    } catch (error) {
        console.error("Error deleting skill:", error);

        if (error.name === 'CastError') {
            return res.status(400).send({ message: "Invalid skill ID format." });
        }
        
        return res.status(500).send({ 
            message: "An internal server error occurred during skill deletion.",
            error: error.message 
        });
    }
};