## Tenant Isolation

Every table that holds business data carries a `business_id` column: businesses, customers, conversations, messages, employees.

`getCustomerById` takes both a customer id and a `business_id`, and filters on both.
```typescript
export async function getCustomerById(
    customerId: number, 
    business_id: number
){
    const result = await db
        .select()
        .from(customers)
        .where(and(
            eq(customers.customer_id, customerId),
            eq(customers.business_id, business_id),
        ))
        .limit(1)
    return result[0];
}
```
A row belonging to another business never comes back at all. Not filtered out afterwards by the service — it never leaves the database.

## Tenant isolation audit
signed in as an employee of business 1, every endpoint was called against business 2's data.

| # | Attack | Expected | Result |
|---|---|---|---|
| 1 | `GET /api/customers/2` | 404 | 404 |
| 2 | `GET /api/conversations/6` | 404 | 404 |
| 3 | `GET /api/conversations/6/messages` | 404 | 404 |
| 4 | `POST /api/conversations/6/messages` | 404 | 404 |
| 5 | `PATCH /api/customers/2` | 404 | 404 |
| 6 | `GET /api/customers` | Own tenant only | 1 row, business 1 |
| 7 | `GET /api/conversations` | Own tenant only | `[]` |
| 8 | `POST /api/customers` with `"business_id": 2` | Created in own tenant | `business_id: 1` |
| 9 | `POST /api/conversations` with another tenant's `customer_id` | 404 | 404 |
| 10 | `GET /api/businesses/me` | Own business | business 1 |

## Where business_id comes from

`business_id` is never taken from the request body — it's derived from the session.
The chain: the session gives a `userId`, which is looked up in `employees`, which
carries the `business_id`.

A request sending `"business_id": 3` creates a row with `business_id: 2` — the value
from the session. Two layers stop it: Zod strips the field because it isn't in the
schema, and the service stamps the real value from the employee row. Either alone
would be enough.

## RBAC (role-based access control)

**The roles:** `admin` and `member`. Stored as a Postgres enum on the `employees` table, so the database itself rejects anything else.

**The rule:** the check is `role !== 'admin'`, not `role === 'member'`. Deny by default — add a third role later and it has no permissions until you grant them explicitly.

**What's gated:** only `POST /api/employees` — inviting an employee. Everything else is daily work, and a role check on reading conversations would be theatre. A member calling it gets 403 "Admin role required" — distinct from 401 (no session) and 403 "Access denied" (logged in but not an employee of any business).

## The existence-leak rule

**The rule:** requesting a record that belongs to another business returns 404, the same as requesting one that doesn't exist. Not 403.

**Why:** different codes would leak information. If "not yours" returned 403 and "doesn't exist" returned 404, someone could walk ids — 1, 2, 3, 4 — and map out how many records exist in other tenants.

**Where it applies:** customers, conversations, messages. Any resource fetched by an id from the URL.

**Where it doesn't:** the employee guard returns 403 "Access denied". That's about the caller's own account, not about another tenant's data — nothing to enumerate.


