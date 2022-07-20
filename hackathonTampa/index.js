const express = require('express')
const ngrok = require('ngrok')
const bodyParser = require('body-parser')
const port = 8080
const {
    parseEmail,
    getAccounts,
    filterAccountsByDomain,
    getSubscriptions,
    filterSubscriptionsById,
    formatSubscription,
    updateDrift
} = require('./utils')
const { get } = require('http')

//Instatiate the App
const app = express()
app.use(bodyParser.json())

//Start server locally
app.listen(port)

//Expose local server to the internet
startNgrok = async () => {
    const url = await ngrok.connect(port)
    console.log(`Server running at ${url}`)
}
startNgrok()

//Webhook logic: listen for when an email is dropped, inspect/parse payload, and send information back into Drift

app.post('/', async (req, res) => {
    try {
        const contactId = req.body.data.id //Grab contactID from conversation payload
        console.log(req.body.data)
        const email = req.body.data.attributes.email //grab Email from conversation payload
        console.log(contactId)
        console.log(email)
        const domain = parseEmail(email) //Parse email and get the domain
        console.log(domain)
        const accountList = await getAccounts() //get list of all accounts
        const subscriptions = await getSubscriptions() //get list of all subscriptions
        console.log(accountList)
        console.log(subscriptions)
        const account = filterAccountsByDomain(accountList, domain) //based off of parsed email, find if they are a customer
        let attributes = {}
        if (account) { //if they are a customer execute the below logic
            const accountId = account.id
            console.log(account)
            const activeSubscription = filterSubscriptionsById(subscriptions, accountId) //find the customers relevant subscriptions to products
            console.log(activeSubscription)
            attributes = formatSubscription(activeSubscription) //format subscription into a proper object to pass into Drift
            attributes.isCustomer = true 
        } else {
            attributes.isCustomer = false
        }
        console.log(attributes)
        await updateDrift(contactId, attributes)

    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
})