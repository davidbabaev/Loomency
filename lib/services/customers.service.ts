import { getCustomerById } from "../repositories/customers.repository";


export async function getCustomers(userId: number){
    const customer = await getCustomerById(userId)
}