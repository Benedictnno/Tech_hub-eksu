import jwt from 'jsonwebtoken';

const generateToken = (res, id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Set HTTP-only cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: true, // Required for sameSite: 'none'
    sameSite: 'none', // Allow cross-site cookies
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
};

export default generateToken;