const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Le nom d\'utilisateur est obligatoire.'],
      unique: true,
      trim: true,
      minlength: [3, 'Le nom doit faire au moins 3 caractères.'],
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères.'],
    },
    email: {
      type: String,
      required: [true, 'L\'email est obligatoire.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Format d\'email invalide.'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Ne jamais retourner le mot de passe dans les requête
    },
  },
  {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
    versionKey: false, // Supprime le champ __v
  }
);

// ── Hook pre-save : hasher le mot de passe avant sauvegarde ──
userSchema.pre('save', async function () {
  // Ne hasher que si le mot de passe a été modifié
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

// ── Hook pre-findOneAndUpdate : hasher le mot de passe lors d'une mise à jour ──
userSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate();
  
  if (update.passwordHash) {
    update.passwordHash = await bcrypt.hash(update.passwordHash, 12);
  } else if (update.$set && update.$set.passwordHash) {
    update.$set.passwordHash = await bcrypt.hash(update.$set.passwordHash, 12);
  }
});

// ── Méthode d'instance : comparer un mot de passe ────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// ── Transformation JSON : ne pas exposer _id et __v ─────────
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.passwordHash;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;