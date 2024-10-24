import Project from '../projects/model';
import { UserType } from './model';
const API_URL = process.env.INFOMANIAK_NEWSLETTER_API_URL;
const API_KEY = process.env.INFOMANIAK_NEWSLETTER_API_KEY;
const API_SECRET = process.env.INFOMANIAK_NEWSLETTER_API_SECRET;
const MAILING_LIST_ID = process.env.INFOMANIAK_NEWSLETTER_MAILING_LIST_ID;

export const optin = async (user: UserType) => {
  if(!API_URL || !API_KEY || !API_SECRET || !MAILING_LIST_ID) {
    return;
  }
  const lastUpdatedOwnedProject = await Project.findOne(
    { 'users.id': user._id, 'users.role': 'owner' },
    {},
    { sort: { updatedAt: -1 } },
  );
  const lastUpdatedJoinedProject = await Project.findOne(
    { 'users.id': user._id, 'users.role': 'user' },
    {},
    { sort: { updatedAt: -1 } },
  );

  const newsletterUser = {
    id: user._id.toString(),
    email: user.email,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
    firstName: user.firstName,
    lastName: user.lastName,
    company: user.company,
    role: user.role,
    optin: user.optin?.toString() || 'true',
    lastLogin: user.lastLogin,
    lastActive: user.lastActive,
    createdAt: user.createdAt,
    lastOwnedProjectCompletionRate:
      lastUpdatedOwnedProject?.completionRate || 0,
    lastJoinedProjectCompletionRate:
      lastUpdatedJoinedProject?.completionRate || 0,
  };

  const data = {
    contacts: [newsletterUser],
  };

  const Authorization =
    'Basic ' + Buffer.from(API_KEY + ':' + API_SECRET).toString('base64');

  const response = await fetch(
    `${API_URL}/mailinglist/${MAILING_LIST_ID}/importcontact`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization,
      },
      body: JSON.stringify(data),
    },
  );
};

export const optout = async (user: UserType) => {
  return optin(user);
};
