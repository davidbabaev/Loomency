export default function Page() {
    async function logMessage(formData: FormData) {
        'use server'
        const message = formData.get('message')
        console.log('Server received:', message)
    }

    return(
        <form action={logMessage}>
            <input type="text" name="message"/>
            <button type="submit">Send</button>
        </form>
    )
}