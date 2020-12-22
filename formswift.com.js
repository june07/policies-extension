let prependedButton = false

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}
function prependButton() {
    let formSwiftButton = document.querySelector('a[class="btn freewrite-upload-btn"]'),
        policiesButton = document.querySelector('[id=policies_june07_com-extension-button]')
    if (formSwiftButton && !policiesButton) {
        policiesButton = htmlToElement(`<button class="btn btn-primary btn-sm" id="policies_june07_com-extension-button">Policies
                <span class="spinner-border spinner-border-sm policies_june07_com-extension-spinner hidden" role="status" aria-hidden="true"></span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-cloud-upload policies_june07_com-extension-icon" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z"/>
                    <path fill-rule="evenodd" d="M7.646 4.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V14.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3z"/>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-cloud-check policies_june07_com-extension-icon hidden" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383zm.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
                    <path fill-rule="evenodd" d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-file-x policies_june07_com-extension-icon hidden" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M4 0h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H4z"/>
                    <path fill-rule="evenodd" d="M6.146 6.146a.5.5 0 0 1 .708 0L8 7.293l1.146-1.147a.5.5 0 1 1 .708.708L8.707 8l1.147 1.146a.5.5 0 0 1-.708.708L8 8.707 6.854 9.854a.5.5 0 0 1-.708-.708L7.293 8 6.146 6.854a.5.5 0 0 1 0-.708z"/>
                </svg>
            </button>`)
        formSwiftButton.insertAdjacentElement('beforebegin', policiesButton)
        prependedButton = true
        policiesButton.addEventListener('click', event => {
            let spinner = event.currentTarget.firstElementChild
            let icon = spinner.nextElementSibling
            let icon2 = icon.nextElementSibling
            let icon3 = icon2.nextElementSibling,
                policy
            spinner.classList.remove('hidden')
            icon.classList.add('hidden')
            
            let documentSettings = Array.from(document.querySelectorAll('script'))
                .filter(script => script.innerText.includes(' DocumentSettings.'))
                .map(script => script.innerText)
            eval(documentSettings.join('\n'))
            policy = {
                name: `${DocumentSettings.name}.pdf`,
                content: DocumentSettings.pdf_link
            }
            chrome.runtime.sendMessage(JSON.stringify({ policy }), response => {
                console.log(`runtime response: ${response}`)
                if (response !== 'ok') {
                    spinner.classList.add('hidden')
                    icon3.classList.remove('hidden')
                } else {
                    spinner.classList.add('hidden')
                    icon2.classList.remove('hidden')
                }
                setTimeout(() => {
                    icon2.classList.add('hidden')
                    icon3.classList.add('hidden')
                    icon.classList.remove('hidden')
                }, 1000)
            })
        })
    }
}
window.addEventListener('load', event => {
    if (!prependedButton) prependButton()
})