const axios = require('axios')
const crmUrl = 'http://bige-hackathon.herokuapp.com/api'
const driftApi = 'https://driftapi.com/contacts'
const driftToken = driftToken

//Parse email to get the domain name 

const parseEmail = (email) => {
    try {
        const domain = email.split('@')[1] || null
        if (!domain) { throw new Error('Email no formatted correctly.') }
        return domain
    } catch (err) {
        throw err
    }
}

//Get the list of accounts (API endpoint automatically returns an array of account objects)

const getAccounts = async () => {
    try {
        const accounts = await axios.get(`${crmUrl}/accounts`)
        return accounts.data
    } catch (err) {
        throw err
    }
}

//Get list of Subscriptions (API endpoint automatically returns an array of subscription objects)

const getSubscriptions = async () => {
    try {
        const subscriptions = await axios.get(`${crmUrl}/subscriptions`)
        return subscriptions.data
    } catch (err) {
        throw err
    }
}

//Filter array of account by domain name to see if they are a customer

const filterAccountsByDomain = (accountList, domain) => {
    const filteredAccounts = accountList.find(account => account.domain.includes(domain.toLowerCase()))
    if (!filteredAccounts) {
        console.log('This company does not have an account with us')
    }
    return filteredAccounts
}

//filter array of subscriptions and leverage a pre determined ID to find current subs for a customer

const filterSubscriptionsById = (subscriptions, accountId) => {
    try {
        const filteredSubscriptions = subscriptions.filter(subscription => subscription.account === accountId)
        return filteredSubscriptions
    } catch (err) {
        throw err
    }
}

//format subscriptions into attribute objects to be sent into Drift

const formatSubscription = (activeSubscription) => {
    try {
        return {
            'has_chat': activeSubscription.some(subscription => subscription.name === 'CHAT'),
            'has_video': activeSubscription.some(subscription => subscription.name === 'VIDEO'),
            'has_email': activeSubscription.some(subscription => subscription.name === 'EMAIL')
        }
    } catch (err) {
        throw err
    }
}

//Update drift with information about customer status and applicable subscriptions

const updateDrift = async (contactId, products) => {
    try {
        console.log(`this is the value of the contactId in the updateDrift function ${contactId}`)
        await axios.patch(`${driftApi}/${contactId}`, {
            "attributes": products
        }, {
            headers: {
                Authorization: `Bearer ${driftToken}`
            }
        })

        console.log(`updated contact successfully`)
    } catch (err) {
        throw err
    }
}
//export functions 
module.exports = {
    parseEmail,
    getAccounts,
    filterAccountsByDomain,
    getSubscriptions,
    filterSubscriptionsById,
    formatSubscription,
    updateDrift
}
