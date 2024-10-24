import { Model } from '@arviva/core';
import { model, Schema } from 'mongoose';

enum ModelStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

const modelSchema = new Schema<Model>(
  {
    name: { type: String, required: true },
    singularName: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String },
    color: { type: String },
    spreadsheetId: { type: String, required: true },
    versionNumber: { type: Number, required: true, default: 1 },
    changelog: { type: String },
    userInformation: { type: String },
    status: {
      type: String,
      default: ModelStatus.DRAFT,
      enum: Object.values(ModelStatus),
    },
    publishedAt: { type: Date },
    config: {
      parameters: {
        range: { type: String, required: true },
        columnIndexes: { type: Schema.Types.Mixed, required: true },
        defaultTitle: { type: String },
        titleParameterId: { type: [String] },
        types: { type: Schema.Types.Mixed },
        sectors: { type: Schema.Types.Mixed },
        externalModules: { type: Schema.Types.Mixed },
      },
      results: {
        range: { type: String, required: true },
        mainIndicatorCode: { type: String },
        mainPieCode: { type: String },
      },
      actions: {
        type: {
          columnIndexes: { type: Schema.Types.Mixed, required: true },
          range: { type: String, required: true },
        },
        required: false,
      },
      sectors: { type: Schema.Types.Mixed, required: false },
      types: { type: Schema.Types.Mixed, required: false },
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);
modelSchema.index({ type: 1, versionNumber: 1 }, { unique: true });

const mongooseModel = model<Model>('Model', modelSchema);

mongooseModel.syncIndexes();

export default mongooseModel;
