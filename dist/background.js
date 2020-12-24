let injectedTabs = {},
    uploadedDocs = 0,
    isLoggedIn = false

function upload(policy) {
    if (!isLoggedIn) return Promise.reject(new Error ('Must log in first.'))

    return new Promise((resolve, reject) => {
        let { name, content } = policy,
            options = {
                withCredentials: true
            },
            data

        if (content.data) {
            Object.assign(options, {
                headers: { 'content-type': 'multipart/form-data' }
            })
            data = new FormData()
            data.append('policy', content.data, name)
        } else {
            data = {
                policies: [{
                    name,
                    content
                }]
            }
        }
        axios.post('https://policies.june07.com/extension/policies/add', data, options)
        .then(response => {
            resolve(response)
        })
        .catch(error => {
            reject(error)
        })
    })
}
function downloadFromGenerator(url) {
    return new Promise((resolve, reject) => {
        axios.get(url, {
            responseType: 'blob'
        })
        .then(response => {
            resolve(response)
        })
        .catch(error => {
            reject(error)
        })
    })
}
function getScriptFileName(tab) {
    let { url } = tab

    if (url.match(/^.*\.termly\.io/i)) {
        return 'termly.io.js'
    } else if (url.match(/formswift\.com/i)) {
        return 'formswift.com.js'
    } else if (url.match(/^.*\.getterms\.io/i)) {
        return 'getterms.io.js'
    }
}
function needToInject(tab) {
    let { url, id } = tab
    let scriptFileName = getScriptFileName(tab)
    if (!scriptFileName) return false

    if (!injectedTabs[id]) {
        return true
    } else if (injectedTabs[id] && injectedTabs[id].scriptFileName && injectedTabs[id].scriptFileName !== scriptFileName) {
        return true
    } else {
        return false
    }
}
function clearInjectionRecord(tab) {
    let { url, id } = tab
    if (!injectedTabs[id]) {
        return false
    } else if (injectedTabs[id].url !== url) {
        delete injectedTabs[id]
        return true
    }
}
function checkAuth() {
    let url = 'https://policies.june07.com'

    chrome.cookies.get({
        name: 'appSession',
        url
    }, cookie => {
        if (!cookie) isLoggedIn = false
        else isLoggedIn = true
        updateBadge()
        //console.log(`Is logged ${isLoggedIn ? 'into' : 'out of'} ${url}`)
    })
}
function openLoginPage() {
    let url = 'https://policies.june07.com/policies'

    chrome.tabs.query({ url: 'https://policies.us.auth0.com/*' }, tabs => {
        if (tabs.length === 0) chrome.tabs.create({ url })
    })
}
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url.match(/^https:\/\/policies\.june07\.com/)) return checkAuth()
    if (changeInfo.status === 'complete') { // && needToInject(tab)) {
        let scriptFileName = getScriptFileName(tab)
        if (!scriptFileName) return
        chrome.tabs.executeScript(tabId, { file: scriptFileName }, result => {
            injectedTabs[tabId] = injectedTabs[tabId] ? injectedTabs[tabId].scriptFileName = scriptFileName : { scriptFileName: scriptFileName }
            injectedTabs[tabId].url = tab.url
            console.log(`Injected ${scriptFileName} into tab ${tabId} with url ${tab.url}`)
            if (!isLoggedIn) openLoginPage()
        })
    } else if (changeInfo.status === 'unloaded' && clearInjectionRecord(tab)) {
        console.log(`Cleared injection record for tab ${tabId}`)
    }
})
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (!validSender(sender)) return
        request = JSON.parse(request)
        if (request.policy) {
            (async () => {
                try {
                    if (request.policy.content.match(/^https?:\/\//)) {
                        // If content is a url, download the content
                        request.policy.content = await downloadFromGenerator(request.policy.content)
                    }
                    await upload(request.policy)
                    sendResponse('ok')
                    uploadedDocs++
                    updateBadge()
                } catch(error) {
                    sendResponse(error)
                }
            })()
        }
        return true
    }
)
chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
        if (request && request.message && request.message === 'version') sendResponse({ version: chrome.runtime.getManifest().version })
    }
)
chrome.browserAction.onClicked.addListener(() => {
    window.open("https://policies.june07.com/policies")
})
function validSender(sender) {
    if (sender.url.match('termly.io')) return true
    if (sender.url.match('formswift.com')) return true
    return false
}
function updateBadge() {
    chrome.browserAction.setBadgeText({
        text: `${isLoggedIn ? uploadedDocs : ''}`
    }, () => {
        //console.log('Updated badge')
    })
}