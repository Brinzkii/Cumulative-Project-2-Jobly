# Jobly Backend

This is the Express backend for Jobly, version 2.

To create tables:

    psql < jobly.sql

To run this:

    node server.js
    
To run the tests:

    jest -i

# Jobly API

## Register user

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
    
    
## Add new user (admin only)

### Request
`POST /users`

    curl -X POST http://localhost:3001/users -H "Content-Type: application/json" -d '{"username":"Random", "password":"random123", "firstName":"first", "lastName":"last", "email":"email@gmail.com", "isAdmin": "false"}
    
### Response
    
    HTTP/1.1 201 Created
    Content-Type: application/json; charset=utf-8
    
    {
        "token": JWT
    }
    
    
## Get list of all users (admin only)

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
    
    
## Get user (admin or user only)

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
    
    
## Patch user (admin or user only)

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
    
    
## Apply for a job (admin or user only)

### Request
`POST /users/[username]/jobs/[jobId]`

    curl -X POST http://localhost:3001/users/[username]/jobs/[jobId] -H "Content-Type: application/json" -H "Authorization: Bearer [JWT]"
    
### Response

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    
    {
        "applied": jobId
    }
    
    
## Delete user (admin or user only)

### Request
`DELETE /users/[username]`

    curl -X DELETE http://localhost:3001/users/[username] -H "Content-Type: application/json" -H "Authorization: Bearer [JWT]"
    
### Response

    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    
    {
        "deleted": username
    }