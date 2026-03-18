const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom de la catégorie est obligatoire.'], // Ajout du message d'erreur
      trim: true,
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères.'],
    },
    color: {
      type: String,
      default: '#FF5733',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false, 
  }
);

// ── Transformation JSON : uniformiser avec Task et User ─────
categorySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Category', categorySchema);