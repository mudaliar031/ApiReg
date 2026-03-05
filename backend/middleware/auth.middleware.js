import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log(`[AUTH] protect middleware - path: ${req.method} ${req.originalUrl}`);
  console.log(`[AUTH] authHeader present: ${!!authHeader}`);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log(`[AUTH] No token provided, rejecting with 401`);
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const token = authHeader.split(" ")[1];
    console.log(`[AUTH] Token extracted, verifying...`);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`[AUTH] Token verified, user: ${JSON.stringify(decoded)}`);

    req.user = decoded; // contains { id, role }
    next();
  } catch (error) {
    console.log(`[AUTH] Token verification failed: ${error.message}`);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const authorize = (roles) => {
  return (req, res, next) => {
    console.log(`[AUTH] authorize middleware - user: ${JSON.stringify(req.user)}, required roles: ${roles}`);
    
    if (!req.user) {
      console.log(`[AUTH] No user in request, rejecting with 403`);
      return res.status(403).json({ message: "Access denied - no user" });
    }
    
    if (!roles.includes(req.user.role)) {
      console.log(`[AUTH] User role ${req.user.role} not in allowed roles ${roles}, rejecting with 403`);
      return res.status(403).json({ message: "Access denied" });
    }
    
    console.log(`[AUTH] Authorization passed`);
    next();
  };
};
