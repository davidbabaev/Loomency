
export const getCustomerProfileCard = {
    name: "get_customer_profile",
    description:
        "Returns the name and phone number of the customer you are currently talking to. " +
        "Use it to greet the customer by name, or to confirm the phone number on file when they ask for a callback. " +
        "It takes no input. It always returns the current customer, never anyone else.",
    input_schema: {
        type: "object",
        properties: {},
    }
}