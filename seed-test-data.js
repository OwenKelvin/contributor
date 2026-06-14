const axios = require('axios');

const GRAPHQL_URL = 'http://127.0.0.1:51002/graphql';

const adminEmail = 'admin@admin.com';
const adminPassword = 'Admin@123';

let token = null;

async function graphql(query, variables = {}, auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await axios.post(
    GRAPHQL_URL,
    { query, variables },
    { headers }
  );
  if (res.data.errors) {
    const err = res.data.errors[0];
    throw new Error(`${err.message}\nQuery: ${query.slice(0, 200)}`);
  }
  return res.data.data;
}

async function login() {
  const data = await graphql(
    `mutation($input: LoginInput!) {
      login(loginInput: $input) { accessToken }
    }`,
    { input: { email: adminEmail, password: adminPassword } },
    false
  );
  token = data.login.accessToken;
}

async function createUsers(count = 20) {
  const users = [];
  for (let i = 1; i <= count; i++) {
    const data = await graphql(
      `mutation($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          email
          firstName
          lastName
        }
      }`,
      {
        input: {
          email: `seeduser${i}@example.com`,
          password: 'Password123!',
          firstName: `First${i}`,
          lastName: `Last${i}`,
          phoneNumber: `+254700000${String(i).padStart(2, '0')}`,
        },
      }
    );
    users.push(data.createUser);
  }
  return users;
}

async function createCategories(count = 5) {
  const categories = [];
  for (let i = 1; i <= count; i++) {
    const data = await graphql(
      `mutation($input: CreateCategoryInput!) {
        createCategory(input: $input) { id name description }
      }`,
      {
        input: {
          name: `Category ${i}`,
          description: `Description for category ${i}`,
        },
      }
    );
    categories.push(data.createCategory);
  }
  return categories;
}

async function createProjects(categories, count = 10) {
  const projects = [];
  const now = new Date();
  const startDate = now.toISOString();
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  for (let i = 1; i <= count; i++) {
    const category = categories[i % categories.length];
    const data = await graphql(
      `mutation($input: CreateProjectInput!) {
        createProject(input: $input) {
          id
          title
          status
        }
      }`,
      {
        input: {
          title: `Project ${i}`,
          description: `Short description for project ${i}`,
          detailedDescription: `Detailed description for project ${i}. This project aims to achieve great things.`,
          goalAmount: 100000 + i * 10000,
          categoryId: category.id,
          startDate,
          endDate,
          status: 'ACTIVE',
        },
      }
    );
    projects.push(data.createProject);
  }
  return projects;
}

async function createContributions(users, projects, count = 20) {
  const contributions = [];
  for (let i = 0; i < count; i++) {
    const user = users[i % users.length];
    const project = projects[i % projects.length];
    const data = await graphql(
      `mutation($input: CreateContributionInput!) {
        createContribution(input: $input) {
          data {
            id
            amount
            paymentStatus
          }
          success
          message
        }
      }`,
      {
        input: {
          amount: 500 + Math.floor(Math.random() * 5000),
          projectId: project.id,
          notes: `Contribution ${i + 1}`,
        },
      }
    );
    contributions.push(data.createContribution.data);
  }
  return contributions;
}

async function main() {
  await login();
  console.log('Logged in as admin');

  console.log('Creating 20 users...');
  const users = await createUsers(20);
  console.log(`Created ${users.length} users`);

  console.log('Creating 5 categories...');
  const categories = await createCategories(5);
  console.log(`Created ${categories.length} categories`);

  console.log('Creating 10 projects...');
  const projects = await createProjects(categories, 10);
  console.log(`Created ${projects.length} projects`);

  console.log('Creating 20 contributions...');
  const contributions = await createContributions(users, projects, 20);
  console.log(`Created ${contributions.length} contributions`);

  console.log('\nDone!');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
