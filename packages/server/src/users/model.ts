import { model, Schema, Types } from 'mongoose';
import { optin, optout } from './newsletter';

if (!process.env.REFRESH_TOKEN_EXPIRY) {
  throw new Error('Environment variable REFRESH_TOKEN_EXPIRY not set');
}

export interface TokenType {
  user: Types.ObjectId;
  value: string;
  createdAt: Date;
}

export const tokenSchema = new Schema<TokenType>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  value: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: Number(eval(process.env.REFRESH_TOKEN_EXPIRY)),
  },
});

export const Token = model<TokenType>('Token', tokenSchema);

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

export interface UserType {
  _id: Types.ObjectId;
  firstName?: string;
  lastName?: string;
  company?: string;
  email: string;
  hash: string;
  resetPasswordToken?: string;
  salt?: string;
  role: Role;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
  lastActive?: Date;
  optin?: boolean;
  lastSeenAt?: Date;
}

const userSchema = new Schema<UserType>(
  {
    firstName: {
      type: String,
      default: '',
    },
    lastName: {
      type: String,
      default: '',
    },
    company: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
    },
    hash: {
      type: String,
      required: false,
    },
    resetPasswordToken: {
      type: String,
    },
    lastLogin: {
      type: Date,
    },
    lastActive: {
      type: Date,
    },
    lastSeenAt: {
      type: Date,
    },
    optin: {
      type: Boolean,
    },
    role: {
      type: String,
      default: Role.USER,
      enum: Object.values(Role),
    },
  },
  { timestamps: true },
);

userSchema.index(
  {
    firstName: 'text',
    lastName: 'text',
    email: 'text',
    company: 'text',
  },
  {
    weights: {
      firstName: 5,
      lastName: 5,
      email: 3,
      company: 2,
    },
  },
);

const optinPaths = [
  'firstName',
  'lastName',
  'company',
  'email',
  'optin',
  'role',
  'createdAt',
  'updatedAt',
  'lastLogin',
  'lastActive',
];
userSchema.pre('save', function (next) {
  if (this.directModifiedPaths().some((path) => optinPaths.includes(path))) {
    if (this.optin) {
      optin(this);
    } else {
      optout(this);
    }
  }
  next();
});

userSchema.pre('remove', function (next) {
  optout(this as unknown as UserType);
  next();
});

// remove hash in serialization to make sure it's not sent by API
userSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.hash;
    delete ret.salt;
    return ret;
  },
});

export default model<UserType>('User', userSchema);
