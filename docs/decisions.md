## Decisions

- **No DELETE on customers:** Conversations and messages reference customers, so deleting one affects their history. The options are soft deletion, cascading deletion of related records, or blocking deletion while references exist. The endpoint is deferred until the intended behavior is decided.

- **Invitations rather than direct employee creation:** The first version returned 201 and added an employee from another business who had never consented to join. I replaced direct creation with invitations so the person must accept before joining a business.

- **Two roles, not four:** Each additional role creates more permission checks to define and maintain. The current features only need two roles; more can be added when a specific feature requires a different level of access.

- **Better Auth rather than hand-rolled:** I built authentication with bcrypt, JWT signing and verification, token expiry, and Google OAuth in a previous project. Choosing Better Auth was deliberate: this multi-tenant B2B app will eventually need SSO (Single sign-on), and I chose to delegate authentication rather than maintain that system myself.