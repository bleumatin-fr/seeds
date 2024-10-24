import { model, Schema } from 'mongoose';

interface Configuration {
  name: string;
  value: any;
}

const configurationSchema = new Schema<Configuration>(
  {
    name: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);

export default model<Configuration>('Configuration', configurationSchema);
