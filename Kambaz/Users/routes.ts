import UsersDao from "./dao";
export default function UserRoutes(app, db) {
  const dao = UsersDao(db);
  const canManageUsers = (user) => user?.role === "FACULTY" || user?.role === "ADMIN";
  const requireFaculty = (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return false;
    }
    if (!canManageUsers(currentUser)) {
      res.sendStatus(403);
      return false;
    }
    return true;
  };
  const signup = (req, res) => {
    const user = dao.findUserByUsername(req.body.username);
    if (user) {
      res.status(400).json({ message: "Username already in use" });
      return;
    }
    const currentUser = dao.createUser(req.body);
    req.session["currentUser"] = currentUser;
    res.json(currentUser);
  };
  const signin = (req, res) => {
    const { username, password } = req.body;
    const currentUser = dao.findUserByCredentials(username, password);
    if (currentUser) {
      req.session["currentUser"] = currentUser;
      res.json(currentUser);
    } else {
      res.status(401).json({ message: "Unable to login. Try again later." });
    }
  };
  const signout = (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
  };
  const profile = (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    res.json(currentUser);
  };
  const findUserById = (req, res) => {
    const user = dao.findUserById(req.params.userId);
    if (!user) {
      res.status(404).json({ message: `Unable to find user with ID ${req.params.userId}` });
      return;
    }
    res.json(user);
  };
  const createUser = (req, res) => {
    if (!requireFaculty(req, res)) return;
    if (dao.findUserByUsername(req.body.username)) {
      res.status(400).json({ message: "Username already in use" });
      return;
    }
    res.json(dao.createUser(req.body));
  };
  const deleteUser = (req, res) => {
    if (!requireFaculty(req, res)) return;
    dao.deleteUser(req.params.userId);
    res.sendStatus(200);
  };
  const updateUser = (req, res) => {
    const userId = req.params.userId;
    const userUpdates = req.body;
    const currentUser = req.session["currentUser"];
    if (currentUser?._id !== userId && !requireFaculty(req, res)) return;
    dao.updateUser(userId, userUpdates);
    const updatedUser = dao.findUserById(userId);
    if (currentUser && currentUser._id === userId) {
      req.session["currentUser"] = updatedUser;
    }
    res.json(updatedUser);
  };
  app.post("/api/users/signup", signup);
  app.post("/api/users/signin", signin);
  app.post("/api/users/signout", signout);
  app.get("/api/users/profile", profile);
  app.post("/api/users", createUser);
  app.get("/api/users/:userId", findUserById);
  app.put("/api/users/:userId", updateUser);
  app.delete("/api/users/:userId", deleteUser);
}
