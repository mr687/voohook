const reqList = document.querySelector('#webhook #sidebar .req-list')
const sortBy = document.querySelector('#webhook #sidebar input[name="_sortBy"]').value
const noReq = document.querySelector('#webhook #sidebar .no-req')
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content')

window.addEventListener('load', function () {
  const client = io()
  client.on('connect', () => {
    console.log('Socket connected!')
  })
  client.on('req-update', (data) => {
    addReqList(data)
  })
})

document.querySelector('.btn-copy')
  .addEventListener('click', async function (e) {
    let text = e.target.getAttribute('data-url')
    if (e.target.tagName.toLowerCase() === 'svg'){
      text = e.target.parentElement.getAttribute('data-url')
    }
    if (!navigator.clipboard) return
    try {
      await navigator.clipboard.writeText(text)
      const toastElement = document.querySelector('.toast')
      if (toastElement){
        toastElement.classList.add('bg-success')
        toastElement.classList.add('text-white')
        toastElement.querySelector('.toast-body').innerHTML = '<i class="fas fa-check-circle me-1"></i>Copied to clipboard!'
        const toast = new bootstrap.Toast(toastElement)
        toast.show()
        toastElement.addEventListener('hidden.bs.toast', function () {
          toastElement.classList.remove('bg-success')
          toastElement.classList.remove('text-white')
          toastElement.querySelector('.toast-body').innerHTML = ''
        })
      }
    } catch (error) {
      console.error(error)
    }
  })

function addReqList(data){
  const item = `
  <a href="${data.href}">
    <form action="${data.delete.action}" method="POST">
      <input type="hidden" name="_method" value="${data.delete.method}">
      <input type="hidden" name="_csrf" value="${csrfToken}">
      <button type="submit" class="action btn btn-sm btn-danger px-2 py-0">x</button>
    </form>
    <span class="badge bg-${data.color}">${data.method}</span>
    <span>#${data.short_id} ${data.host}</span>
    <div class="small">${data.date_string}</div>
  </a>
  `
  const html = document.createRange().createContextualFragment(item)
  if (noReq && noReq.classList.contains('d-flex')){
    noReq.classList.remove('d-flex')
    noReq.classList.add('d-none')
    window.location = data.href
  }
  if (sortBy.toLowerCase() === 'desc'){
    reqList.append(html)
  }else{
    reqList.prepend(html)
  }
}