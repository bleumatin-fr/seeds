import { ProjectUser, Report } from '@arviva/core';
import { model, Schema } from 'mongoose';
import { projectSchema } from '../projects/model';

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

const reportSchema = new Schema<Report>(
  {
    name: { type: String, required: true },
    users: [projectUserSchema],
    results: { type: Schema.Types.Mixed },
    projects: [projectSchema]
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);

export default model<Report>('Report', reportSchema);
