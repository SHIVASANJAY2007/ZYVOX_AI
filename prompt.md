| Credential | values
| ---------- | ------------------------ 
| Host       | `host.docker.internal`              
| Port       | `5432`                   
| Database   | `zyvox`                  
| Username   | `zyvox_user`             
| Password   | `password`



Modify the existing ZYVOX codebase to connect the BACKEND to my PostgreSQL database.

IMPORTANT:

* Do NOT change or redesign the existing UI.
* Do NOT remove or break any existing ZYVOX functionality.
* Do NOT connect PostgreSQL directly from the React/Vite frontend.
* PostgreSQL credentials must exist ONLY in backend environment variables.
* Never hardcode the PostgreSQL password, connection string, API keys, or other secrets.
* Reuse the existing backend architecture if one already exists.
* If the project already has a database/service layer, integrate PostgreSQL into that existing structure instead of creating unnecessary duplicate architecture.

DATABASE:

PostgreSQL is running locally in Docker.

Database:
zyvox

Host for backend running directly on my Windows machine:
localhost

Port:
5432

Username:
zyvox_user

Password:
[USE_MY_EXISTING_POSTGRES_PASSWORD_FROM_ENV_ONLY]

The PostgreSQL connection string must be stored in the backend .env file as:

DATABASE_URL=postgresql://zyvox_user:YOUR_PASSWORD@localhost:5432/zyvox

Do NOT commit .env to Git.

DATABASE TABLES:

1. personal_details

Columns:

* person_id VARCHAR(20) PRIMARY KEY
* name VARCHAR(100) NOT NULL
* phone VARCHAR(20) NOT NULL
* email VARCHAR(255) UNIQUE NOT NULL
* password_hash TEXT NOT NULL
* created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
* last_login TIMESTAMP

2. travel_details

Columns:

* travel_id SERIAL PRIMARY KEY
* person_id VARCHAR(20) NOT NULL
* source VARCHAR(100) NOT NULL
* destination VARCHAR(100) NOT NULL
* date_of_going DATE
* date_of_returning DATE
* activities TEXT
* mode_of_transport VARCHAR(50)
* hotel_required BOOLEAN DEFAULT FALSE
* hotel_name VARCHAR(200)
* car_rent BOOLEAN DEFAULT FALSE

Relationship:
travel_details.person_id → personal_details.person_id

3. chat_history

Columns:

* chat_id BIGSERIAL PRIMARY KEY
* person_id VARCHAR(20) NOT NULL
* session_id VARCHAR(100)
* role VARCHAR(20) NOT NULL
* message TEXT NOT NULL
* created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Relationship:
chat_history.person_id → personal_details.person_id

IMPLEMENTATION:

1. Detect whether the backend already uses Node.js/Express or another backend framework.

2. If the backend is Node.js:

   * Use the official PostgreSQL Node.js driver package "pg".
   * Install it only if it is not already installed.
   * Create a reusable PostgreSQL connection pool.
   * Read DATABASE_URL from process.env.
   * Do not create a new database connection for every request.

3. Add a backend database module/service, for example:
   backend/config/database.js
   or
   backend/config/db.js

Use a PostgreSQL Pool.

4. Add a database connection test endpoint or startup check that verifies PostgreSQL connectivity without exposing credentials.

5. Add API/service functions for:

USER:

* Create user
* Find user by email
* Find user by person_id
* Update last_login

TRAVEL:

* Create travel plan
* Get all travel plans for a user
* Get a specific travel plan
* Update travel plan
* Delete travel plan

CHAT:

* Save a user message
* Save an assistant message
* Get chat history for a user/session
* Get recent chat history ordered by created_at

6. Use parameterized SQL queries everywhere.
   Never construct SQL using string concatenation with user input.

7. Passwords:

* Never store plain-text passwords.
* Use bcrypt or the project's existing secure password hashing mechanism.
* Store only the resulting password hash in password_hash.
* Never return password_hash in API responses.

8. Add or update .env.example with:

DATABASE_URL=postgresql://zyvox_user:YOUR_PASSWORD@localhost:5432/zyvox

Do NOT put the real password in .env.example.

9. Ensure .gitignore contains:

.env
.env.*
!.env.example

10. Add appropriate error handling for:

* PostgreSQL connection failure
* Query failure
* Duplicate email
* Invalid person_id
* Missing travel plan
* Missing chat session

11. Keep the existing API response format and frontend behavior unchanged unless a database-backed endpoint requires a minimal change.

12. After implementation, report:

* Which files were created/modified
* Which npm packages were added
* Where DATABASE_URL must be placed
* Which API endpoints were added
* How to start the backend
* How to test the PostgreSQL connection
* How to test user, travel, and chat operations

Before modifying anything, inspect the existing project structure and identify the actual backend entry point and existing API/database architecture.
