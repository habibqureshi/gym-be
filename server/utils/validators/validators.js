const { validateRoute } = require('express-ajv-middleware')
const signInValidator = () => {
    return validateRoute({
        body: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
                email: {
                    type: 'string',
                    nullable: false,
                    minLength: 3,
                    maxLength: 100,
                    errorMessage: "User Name is not valid"
                },
                password: {
                    type: 'string',
                    nullable: false,
                    minLength: 5,
                    maxLength: 100,
                    errorMessage: "Password is not valid"
                }

            },
            additionalProperties: false
        }
    })
}


const signUpValidator = () => {
    return validateRoute({
        body: {
            type: 'object',
            required: ['firstName', "lastName", "password", "email", "userName"],
            additionalProperties: false,
            properties: {
                firstName: {
                    type: "string",
                    nullable: false,
                    minLength: 2,
                    maxLength: 100,
                    errorMessage: "First Name is not valid"
                },
                lastName: {
                    type: "string",
                    nullable: false,
                    minLength: 2,
                    maxLength: 100,
                    errorMessage: "Last Name is not valid"
                },
                userName: {
                    type: "string",
                    nullable: false,
                    minLength: 2,
                    maxLength: 100,
                    errorMessage: { message: "userName is Not Valid" }
                },
                email: {
                    type: "string",
                    nullable: false,
                },
                password: {
                    type: "string",
                    nullable: false,
                    minLength: 5,
                    maxLength: 100,
                    errorMessage: "Password is not valid"
                },
                roles: {
                    type: 'array',
                    items: {
                        type: "string"
                    }
                }
            },

        }
    })
}
module.exports = { signInValidator, signUpValidator }