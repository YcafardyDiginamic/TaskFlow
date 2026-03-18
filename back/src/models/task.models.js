const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre est obligatoire.'],
      trim: true,
      maxlength: [150, 'Le titre ne peut pas dépasser 150 caractères.'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in_progress', 'done'],
        message: 'Statut invalide. Valeurs autorisées : todo, in_progress, done',
      },
      default: 'todo',
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priorité invalide. Valeurs autorisées : low, medium, high',
      },
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Index pour accélérer les requêtes par utilisateur
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null, // Optionnel : une tâche n'est pas obligée d'avoir une catégorie
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Index composé pour les filtres fréquents ─────────────────
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

// ── Transformation JSON ──────────────────────────────────────
taskSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;