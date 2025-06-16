# GraphQL Profile Page

## Project Description

The objective of this project is to learn the GraphQL query language by creating a personalized profile page. You'll be using the provided GraphQL endpoint to query your data and display it on your profile. Additionally, you will create a login page and visualize the data using statistics graphs.

## Features

- **Profile Display**: Your profile will display three pieces of information which you may choose, such as:
  - Basic user identification
  - XP amount
  - Grades
  - Audits
  - Skills
- **Statistic Graphs**: The profile will include a mandatory section for the generation of statistical graphs (e.g., XP earned, project progress, audit ratio, etc.).
- **GraphQL Integration**: Use GraphQL to fetch your profile data from the provided API endpoint.
- **Interactive Graphs**: The graphs can be made interactive and animated using SVG.
- **Authentication**: Log in using JWT to access the GraphQL API, and display data relevant to the authenticated user.
- **Responsive Design**: The profile page will have a clean and user-friendly design.

## GraphQL API

You will query the following GraphQL endpoint for your profile data:

- Endpoint: [GraphQL API](https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql)

The JWT token is required for authentication, and can be obtained by signing in via the [signin endpoint](https://learn.zone01oujda.ma/api/auth/signin).

### Example GraphQL Queries

1. **Fetching User Information**:
   ```graphql
   {
     user {
       id
       login
     }
   }
   ```
2. **Fetching Object Information**:
```graphql
{
  object(where: { id: { _eq: 3323 } }) {
    name
    type
  }
}
```

3. **Nested Query Example**:

```graphql
{
  result {
    id
    user {
      id
      login
    }
  }
}
```

---

### **Part 4: Requirements**

```markdown
## Requirements

- **Frontend**: HTML, CSS, and JavaScript for building the profile UI.
- **GraphQL**: Use GraphQL to fetch the required data from the API.
- **SVG**: Create graphs using SVG, which could include progress bars, line charts, etc.
- **JWT Authentication**: Implement JWT authentication to securely access the GraphQL data.
```

### **Part 5: Login Page**

```markdown
## Login Page

You will need to authenticate using the **JWT** token to access the data. The login page should allow users to log in with:

- **Username** and **Password**, or
- **Email** and **Password**

If the credentials are invalid, display an appropriate error message.

Once logged in, a JWT is generated, and this token should be used to authenticate API requests to access user-specific data.
```

### Example Login Request:

```bash
POST https://learn.zone01oujda.ma/api/auth/signin
```

---

### **Part 6: Data Model**

```markdown
## Data Model

Here are some of the key tables and columns available via the GraphQL API:

- **User Table**: Contains basic information about the user.

  - `id`: User's unique identifier.
  - `login`: User's login username.

- **Transaction Table**: Contains information about XP transactions.

  - `id`: Transaction identifier.
  - `type`: Type of transaction (e.g., XP earned).
  - `amount`: Amount of XP earned.

- **Progress Table**: Tracks user progress in exercises.

  - `id`: Progress entry identifier.
  - `grade`: The grade received.

- **Result Table**: Contains results and grades for various tasks.

  - `id`: Result identifier.
  - `grade`: Result grade.

- **Object Table**: Lists exercises or projects.
  - `id`: Object identifier.
  - `name`: Name of the object (exercise/project).
```

### **Part 7: Graphs to Include**

```markdown
## Graphs to Include

You need to generate at least two different types of statistics graphs. Some examples include:

1. **XP Progress**: Track XP earned over time or by project.
2. **Audit Ratio**: Visualize the ratio of audits completed versus pending.
3. **PASS/FAIL Ratio**: Display statistics on project pass and fail ratios.
4. **Exercise Attempts**: Show the number of attempts for each exercise.

Use **SVG** to create interactive and animated graphs. You can choose from progress bars, pie charts, line charts, or other graph types.
```

### **Part 8: Future Enhancements**

```markdown
## Future Enhancements

Feel free to add more features and data visualizations as you progress. Here are some ideas:

- Add filters to allow users to view data for specific time periods.
- Integrate additional GraphQL queries to display more personalized data.
- Improve the UI/UX with animations, transitions, and responsive design.
```

### **Part 9: How to Run the Project Locally**

````
### 1. Clone this repository:
```bash
   git clone https://github.com/yourusername/graphql-profile-page.git

   cd graphql-profile-page
````

### 2. Open the index.html file in your browser to view the profile page.

---

### **Part 10: License**

```markdown
## License

This project is licensed under the Zone01Oujda License.
```
