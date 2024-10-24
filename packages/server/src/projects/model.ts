import { Project, ProjectUser } from '@arviva/core';
import { model, Schema } from 'mongoose';

const projectUserSchema = new Schema<ProjectUser>(
  {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'owner'],
    },
    lastSeenAt: {
      type: Date
    },
  },
  { _id: false },
);

projectUserSchema.virtual('user', {
  localField: 'id',
  foreignField: '_id',
  ref: 'User',
  justOne: true,
});

projectUserSchema.set('toObject', { virtuals: true });
projectUserSchema.set('toJSON', { virtuals: true });

export type ExtendedProject = Project & {
  deletedAt?: Date;
};

export const projectSchema = new Schema<ExtendedProject>(
  {
    name: { type: String, required: true },
    users: [projectUserSchema],
    sectors: { type: Schema.Types.Mixed, required: false },
    completionRate: { type: Schema.Types.Number, default: 0 },
    uncompleted: { type: Schema.Types.Mixed, default: [] },
    new: { type: Schema.Types.Mixed, default: [] },
    spreadsheetId: { type: String, required: true },
    results: { type: Schema.Types.Mixed, required: false },
    actions: {
      type: Schema.Types.Mixed,
      required: false,
    },
    tour: { type: Schema.Types.Mixed },
    buildings: { type: Schema.Types.Mixed },
    projects: { type: Schema.Types.Mixed },
    model: { type: Schema.Types.Mixed },
    references: { type: Schema.Types.Mixed },
    public: { type: Schema.Types.Boolean, default: false },
    deletedAt: { type: Date },
    data: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);

export default model<ExtendedProject>('Project', projectSchema);
