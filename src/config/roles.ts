const allRoles: { [k: string]: string[] } = {
  user: [],
  admin: ['getUsers', 'addUsers', 'updateUsers', 'deleteUsers'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

export { roles, roleRights };
