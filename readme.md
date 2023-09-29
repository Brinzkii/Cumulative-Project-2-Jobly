# Jobly Backend

This is the Express backend for Jobly, version 2.

To create tables:

    psql < jobly.sql

To run this:

    node server.js
    
To run the tests:

    jest -i

# Jobly API

## Register User

### Request
`POST /auth/register`

    curl -X POST http://localhost:3001/auth/register -H "Content-Type: application/json" -d '{"username":"Random", "password":"random123", "firstName":"first", "lastName":"last", "email":"email@gmail.com"}'
    
    
### Response
    
    HTTP/1.1 201 Created
    Content-Type: application/json; charset=utf-8
    
    {
        "token": JWT
    }
    
    
## Retrieve token

### Request
`POST /auth/token`

    curl -X POST http://localhost:3001/auth/token -H "Content-Type: application/json" -d '{"username":"Random", "password":"random123"}'
    
    
### Response

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    
    {
        "token": JWT
    }
    
    
## Add new User (admin only)

### Request
`POST /users`

    curl -X POST http://localhost:3001/users -H "Content-Type: application/json" -d '{"username":"Random", "password":"random123", "firstName":"first", "lastName":"last", "email":"email@gmail.com", "isAdmin": "false"}
    
### Response
    
    HTTP/1.1 201 Created
    Content-Type: application/json; charset=utf-8
    
    {
        "token": JWT
    }
    
    
## Get list of all Users (admin only)

### Request
`GET /users`

    curl -X GET http://localhost:3001/users -H "Content-Type: application/json" -H "Authorization: Bearer [JWT]"
    
### Response
    
    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    
    {
        "users": [
            {
                "username": "Random",
                "firstName": "First",
                "lastName": "Last",
                "email": "email@gmail.com",
                "isAdmin": false,
            },
            {
                ...
            }
        ]
    }
    
    
## Get User (admin or user only)

### Request
`GET /users/[username]`

    curl -X GET http://localhost:3001/users/[username] -H "Content-Type: application/json" -H "Authorization: Bearer [JWT]"
    
### Response

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    
    {
        "user": {
            {
                "username": "Random",
                "firstName": "First",
                "lastName": "Last",
                "email": "email@gmail.com",
                "isAdmin": false,
                "jobs": [jobId, jobId, ...]
            }
        }
    }
    
    
## Patch User (admin or user only)

### Request
`PATCH /users/[username]`

    curl -X PATCH http://localhost:3001/users/Brinzkii -H "Content-Type: application/json" -H "Authorization: Bearer [JWT]" -d '{"firstName":"new first", "lastName": "new last", "password": "new password", "email": "newemail@gmail.com"}'
    
### Response

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    
    {
        "user": {
            {
                "username": "username",
                "firstName": "new first",
                "lastName": "new last",
                "email": "newemail@gmail.com",
                "isAdmin": false
            }
        }
    }
    
    
## Apply for a Job (admin or user only)

### Request
`POST /users/[username]/jobs/[jobId]`

    curl -X POST http://localhost:3001/users/[username]/jobs/[jobId] -H "Content-Type: application/json" -H "Authorization: Bearer [JWT]"
    
### Response

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    
    {
        "applied": jobId
    }
    
    
## Delete User (admin or user only)

### Request
`DELETE /users/[username]`

    curl -X DELETE http://localhost:3001/users/[username] -H "Content-Type: application/json" -H "Authorization: Bearer [JWT]"
    
### Response

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    
    {
        "deleted": username
    }
    
    
## Add a Company (admin only)

### Request
`POST /companies`

    curl -X POST http://localhost:3001/companies -H "Content-Type: application/json" -H "Authorization: Bearer [JWT]" -d '{"handle":"cmp", "name":"Company", "description":"test company", "numEmployees":1, "logoUrl":"/logos/logo1.png"}'
    
### Response
    
    HTTP/1.1 201 Created
    Content-Type: application/json; charset=utf-8
    
    {
        "company": {
            handle,
            name,
            description,
            numEmployees,
            logoUrl
        }
    }
    
    
## Get list of Companies - supports partial filtering

### Request
`GET /companies`

#### Filter methods:
-minEmployees

-maxEmployees

-nameLike

    curl -X GET http://localhost:3001/companies -H "Content-Type: application/json" -d '{"minEmployees": [number], "maxEmployees": [number], "nameLike": "[string]"}'
    
### Response

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    
    {
        "companies": [
            {
                handle,
                name,
                description,
                numEmployees,
                logoUrl
            },
            {
                handle,
                name,
                description,
                numEmployees,
                logoUrl
            }, ...
        ]
    }
    
    
## Get Company by handle

### Request
`GET /companies/[handle]`

    curl -X GET http://localhost:3001/companies/[handle] -H "Content-Type: application/json" -d '{"handle": [handle]}'
    
### Response

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    
    {
        "company": {
            handle,
            name,
            description,
            numEmployees,
            logoUrl,
            jobs: [jobId, jobId, ...]
        }
    }
    
    
## Patch Company (admin only) - supports partial patching

### Request
`PATCH /companies/[handle]`

#### Patchable fields:
-name

-description

-numEmployees

-logoUrl

    curl -X PATCH http://localhost:3001/companies/[handle] -H "Content-Type: application/json" -H "Authorization: Bearer [JWT]" -d '{"name":"Company", "description":"test company", "numEmployees":1, "logoUrl":"/logos/logo1.png"}'
    
### Response

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    
    {
        "company": {
            handle,
            name,
            description,
            numEmployees,
            logoUrl,
        }
    }
    
    
## Delete Company (admin only)

### Request
`DELETE /companies/[handle]`

    curl -X DELETE http://localhost:3001/companies/[handle] -H "Content-Type: application/json" -H "Authorization: Bearer [JWT]"
    
### Response

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    
    {
        "deleted": "[handle]"
    }
    
    
## Post Job (admin only)

### Request
`POST /jobs`

    curl -X POST http://localhost:3001/jobs -H "Content-Type: application/json" -d '{"title":"Job Title", "salary": 10000, "equity":0.15, "companyHandle": "[handle]"}'
    
### Response

    HTTP/1.1 201 Created
    Content-Type: application/json; charset=utf-8
    
    {
        job: {
            id,
            title,
            salary,
            equity,
            company
        }
    }
    
    
## Get list of jobs - supports partial filtering

### Request
`GET /jobs`

#### Filter methods:
-title

-minSalary

-hasEquity

    curl -X GET http://localhost:3001/jobs -H "Content-Type: application/json" -d '{"title": "[jobTitle]", "minSalary": [number], "hasEquity": "[boolean]"}'
    
### Response

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    
    {
        jobs: [
            {
                id,
                title,
                salary,
                equity,
                company
            },
            {
                ...
            }, ...
        ]
    }
    
    
## Get Job by ID (admin only)

### Request
`GET /jobs/[id]`

    curl -X GET http://localhost:3001/jobs/[id] -H "Content-Type: application/json" -H "Authorization: Bearer [JWT]"
    
### Response

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    
    {
        job: {
            id,
            title,
            salary,
            equity,
            company: {
                handle,
                name,
                description,
                numEmployees,
                logoUrl
            }
        }
    }
    
    
## Patch Job (admin only) - supports partial patching

### Request
`PATCH /jobs/[id]`

#### Patchable fields:
-title

-salary

-equity

    curl -X PATCH http://localhost:3001/jobs/[id] -H "Content-Type: application/json" -H "Authorization: Bearer [JWT]" -d '{"title":"Company", "salary":[number], "equity":"[number]"}'
    
### Response

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    
    {
        job: {
            id,
            title,
            salary,
            equity,
            company
        }
    }
    
    
## Delete Job (admin only)

### Request
`DELETE /jobs/[id]`

    curl -X DELETE http://localhost:3001/jobs/[id] -H "Content-Type: application/json" -H "Authorization: Bearer [JWT]"
    
### Response

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    
    {
        "deleted": "id([id]) - [title]"
    }