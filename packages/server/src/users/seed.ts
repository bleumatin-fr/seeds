import User, { Role } from './model';

const seed = async () => {
  const admin = await User.findOne({
    email: 'admin',
  });
  if (admin || process.env.NODE_ENV !== 'development') {
    return;
  }
  const userToRegister = new User({
    email: 'admin',
    firstName: 'Administrateur',
    lastName: 'Arviva',
    company: 'Arviva',
    // = password
    hash: '$2b$10$Zq2Q6Chp53thAJnB0h0LJ.HQ6.7LmmpBSFVSUQMk1FCN8R.OXivyS',
    role: Role.ADMIN,
  });
  await userToRegister.save();
  console.log('User admin seeded');
};

export default seed;
