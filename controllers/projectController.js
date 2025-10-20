const Project = require('../models/Project'); 
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const processTags = (tagsInput) => {
  if (!tagsInput) return [];

  // If it's already an array (e.g. ["React", "Node.js"])
  if (Array.isArray(tagsInput)) {
    return tagsInput.map(tag => String(tag).trim()).filter(tag => tag.length > 0);
  }

  // If it's a plain string (e.g. "React, Node.js")
  if (typeof tagsInput === 'string') {
    return tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }

  // If it's something else (e.g. object or number), return empty array safely
  return [];
};

exports.createProject = async (req, res) => {
  try {
    const { title, tags, description, liveUrl, repoUrl } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    let imageUrl = 'https://picsum.photos/600/400';
    let imagePublicId = null; // 👈 store public_id here

    if (req.file) {
      const uploadFromBuffer = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'portfolio_projects' },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      const uploadResult = await uploadFromBuffer();
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id; // 👈 save Cloudinary public_id
      console.log('✅ Uploaded to Cloudinary:', imageUrl);
    }

    const newProject = new Project({
      title,
      tags,
      description,
      imageUrl,
      imagePublicId, // 👈 store public_id in MongoDB
      liveUrl,
      repoUrl,
      owner: req.user.id,
    });

    const project = await newProject.save();
    console.log('✅ Project saved:', project._id);

    res.status(201).json({
      message: 'Project created successfully!',
      project,
    });
  } catch (error) {
    console.error('❌ Error creating project:', error);
    res.status(500).json({
      message: 'Failed to create project.',
      error: error.message,
    });
  }
};


// =======================================================
// R - READ All Projects (GET /api/projects) - PUBLIC
// =======================================================
exports.getAllProjects = async (req, res) => {
    // ... (logic remains completely unchanged)
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to retrieve projects.',
            error: error.message,
        });
    }
};

// =======================================================
// R - READ Single Project (GET /api/projects/:id) - PUBLIC
// =======================================================
exports.getProjectById = async (req, res) => {
    // ... (logic remains completely unchanged)
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }
        res.status(200).json({
            message: 'Project retrieved successfully.',
            project,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to retrieve project.',
            error: error.message,
        });
    }
};

// =======================================================
// U - UPDATE Project (PUT /api/projects/:id) - SECURED
// =======================================================

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found or unauthorized.' });
    }

    // Update basic fields
    if (req.body.title) project.title = req.body.title;
    if (req.body.description) project.description = req.body.description;
    if (req.body.liveUrl) project.liveUrl = req.body.liveUrl;
    if (req.body.repoUrl) project.repoUrl = req.body.repoUrl;

    // ✅ Handle tags robustly
    if (req.body.tags) {
      project.tags = processTags(req.body.tags);
    }

    project.updatedAt = Date.now();

    // ✅ Handle new image upload (replace old)
    if (req.file) {
      if (project.imagePublicId) {
        await cloudinary.uploader.destroy(project.imagePublicId);
      }

      const uploadFromBuffer = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'portfolio_projects' },
            (error, result) => (result ? resolve(result) : reject(error))
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

      const uploadResult = await uploadFromBuffer();
      project.imageUrl = uploadResult.secure_url;
      project.imagePublicId = uploadResult.public_id;
    }

    const updatedProject = await project.save();

    res.status(200).json({
      message: 'Project updated successfully! ✏️',
      project: updatedProject,
    });
  } catch (error) {
    console.error('❌ Error updating project:', error);
    res.status(500).json({
      message: 'Failed to update project.',
      error: error.message,
    });
  }
};



// =======================================================
// D - DELETE Project (DELETE /api/projects/:id) - SECURED
// =======================================================
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Optional: Ensure only owner/admin can delete
    if (project.owner.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this project.' });
    }

    // Delete image from Cloudinary if it exists
    if (project.imagePublicId) {
      await cloudinary.uploader.destroy(project.imagePublicId);
      console.log('🗑️ Deleted image from Cloudinary:', project.imagePublicId);
    }

    await Project.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Project and image deleted successfully!' });
  } catch (error) {
    console.error('❌ Error deleting project:', error);
    res.status(500).json({ message: 'Failed to delete project.', error: error.message });
  }
};
