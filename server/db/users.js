import { connection } from './connection.js';

const getUserTable = () => connection.table('user');

export async function getUser(id) {
  return await getUserTable().first().where({ id });
}

export async function getUserByEmail(email) {
  return await getUserTable().first().where({ email });
}

export async function updateUser({ id, companyId, email }) {
  const user = await getUserTable().first().where({ id });
  if (!user) {
    return null;
  }
  const updatedFields = { companyId, email };;
  await getUserTable().update(updatedFields).where({ id });
  return { ...user, ...updatedFields };
}