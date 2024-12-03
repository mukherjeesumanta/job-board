import { GraphQLError } from 'graphql';
import { createCompany, deleteCompany, getCompany } from './db/companies.js';
import { createJob, deleteJob, getJob, getJobs, getJobsByCompany, updateJob } from './db/jobs.js';
import { updateUser } from './db/users.js';

export const resolvers = {
  Query: {
    company: async (_root, { id }) => {
      const company = await getCompany(id);
      if (!company) {
        throw notFoundError('No Company found with id ' + id);
      }
      return company;
    },
    job: async (_root, { id }) => {
      const job = await getJob(id);
      if (!job) {
        throw notFoundError('No Job found with id ' + id);
      }
      return job;
    },
    jobs: () => getJobs(),
  },

  Mutation: {
    createJob: (_root, { input: { title, description } }, { user }) => {
      if (!user) {
        throw unauthorizedError('Missing authentication');
      }
      return createJob({ companyId: user.companyId, title, description });
    },

    deleteJob: async (_root, { id }, { user }) => {
      if (!user) {
        throw unauthorizedError('Missing authentication');
      }
      const job = await deleteJob(id, user.companyId);
      if (!job) {
        throw notFoundError('No Job found with id ' + id);
      }
      return job;
    },

    updateJob: async (_root, { input: { id, companyId, title, description } }, { user }) => {
      if (!user) {
        throw unauthorizedError('Missing authentication');
      }
      const job = await updateJob({ id, companyId: user.companyId, title, description });
      // const job = await updateJob({ id, companyId: companyId });
      if (!job) {
        throw notFoundError('No Job found with id ' + id);
      }
      return job;
    },

    createCompany: (_root, { input: { name, description } }) => {
      return createCompany({ name, description });
    },

    deleteCompany: async (_root, { id }, { user }) => {
      if (!user) {
        throw unauthorizedError('Missing authentication');
      }
      const company = await deleteCompany(id);
      if (!company) {
        throw notFoundError('No company found with id ' + id);
      }
      return company;
    },

    updateUser: async (_root, { input: { id, companyId, email } }, { user }) => {
      if (!user) {
        throw unauthorizedError('Missing authentication');
      }
      const userRes = await updateUser({ id, companyId, email });
      if (!userRes) {
        throw notFoundError('No Job found with id ' + id);
      }
      return userRes;
    },
  },

  Company: {
    jobs: (company) => getJobsByCompany(company.id),
  },

  Job: {
    company: (job) => getCompany(job.companyId),
    date: (job) => toIsoDate(job.createdAt),
  },
};

function notFoundError(message) {
  return new GraphQLError(message, {
    extensions: { code: 'NOT_FOUND' },
  });
}

function unauthorizedError(message) {
  return new GraphQLError(message, {
    extensions: { code: 'UNAUTHORIZED' },
  });
}

function toIsoDate(value) {
  return value.slice(0, 'yyyy-mm-dd'.length);
}
