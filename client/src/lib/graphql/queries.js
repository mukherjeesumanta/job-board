import { ApolloClient, ApolloLink, concat, createHttpLink, gql, InMemoryCache } from "@apollo/client";
// import { GraphQLClient/* , gql */ } from 'graphql-request';
import { getAccessToken } from '../auth';

// const client = new GraphQLClient('http://localhost:5000/graphql', {
//   headers: () => {
//     const accessToken = getAccessToken();
//     if (accessToken) {
//       return { 'Authorization': `Bearer ${accessToken}` };
//     }
//     return {};
//   },
// });

const httpLink = createHttpLink({ uri: 'http://localhost:5000/graphql' });
const authLink = new ApolloLink((operation, forward) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    operation.setContext({
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
  }
  return forward(operation);
})
const apolloClient = new ApolloClient({
  // uri: 'http://localhost:5000/graphql',
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'cache-first'
    },

    // This is to be used by react hooks
    watchQuery: {
      fetchPolicy: 'cache-first'
    }
  }
});

export async function createJob({ title, description }) {
  const mutation = gql`
    mutation CreateJob($input: CreateJobInput!) {
      job: createJob(input: $input) {
        id
      }
    }
  `;
  // const { job } = await client.request(mutation, {
  //   input: { title, description },
  // });
  // return job;

  const { data } = await apolloClient.mutate({
    mutation,
    variables: {
      input: { title, description }
    }
  });
  return data.job;
}

export async function getCompany(id) {
  const query = gql`
    query CompanyById($id: ID!) {
      company(id: $id) {
        id
        name
        description
        jobs {
          id
          date
          title
        }
      }
    }
  `;
  // const { company } = await client.request(query, { id });
  // return company;

  const { data } = await apolloClient.query({
    query,
    variables: { id }
  });
  return data.company;
}

export async function getJob(id) {
  const query = gql`
    query JobById($id: ID!) {
      job(id: $id) {
        id
        date
        title
        company {
          id
          name
        }
        description
      }
    }
  `;
  //const { job } = await client.request(query, { id });
  const { data } = await apolloClient.query({
    query,
    variables: { id }
  });
  return data.job;
}

export async function getJobs() {
  const query = gql`
    query {
      jobs {
        id
        date
        title
        company {
          id
          name
        }
      }
    }
  `;
  //const { jobs } = await client.request(query);
  const result = await apolloClient.query({
    query,
    fetchPolicy: 'network-only'
  });
  return result.data.jobs;
}
