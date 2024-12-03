import { connection } from "./connection.js";
import { generateId } from "./ids.js";

const getCompanyTable = () => connection.table("company");

export async function getCompany(id) {
  return await getCompanyTable().first().where({ id });
}

export async function createCompany({ name, description }) {
  const company = {
    id: generateId(),
    name,
    description,
  };
  await getCompanyTable().insert(company);
  return company;
}

export async function deleteCompany(id) {
  const company = await getCompanyTable().first().where({ id });
  if (!company) {
    return null;
  }
  await getCompanyTable().delete().where({ id });
  return company;
}