exports.sanitizeUser = function (user) {
  return {
    id: user.id,
    username: user.name,
    email: user.email,
  };
};
