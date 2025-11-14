const form=document.getElementById('todo-form')
const titleInput=document.getElementById('todo-title')
const descInput=document.getElementById('todo-desc')
const dateInput=document.getElementById('date-input')
const todoList=document.getElementById('todo-list')
const filterStatus=document.getElementById('filter-status')
const clearFilter=document.getElementById('clear-filter')
const clearAll=document.getElementById('clear-all')
const total=document.getElementById('total')
const done=document.getElementById('done')
const pending=document.getElementById('pending')
const themeToggle=document.getElementById('theme-toggle')
const searchInput=document.getElementById('search-input')
const undoBox=document.getElementById('undo-box')
const undoText=document.getElementById('undo-text')
const undoBtn=document.getElementById('undo-btn')
const addSound=document.getElementById('add-sound')
const doneSound=document.getElementById('done-sound')
const deleteSound=document.getElementById('delete-sound')

let todos=JSON.parse(localStorage.getItem('todos'))||[]
let themeIndex=Number(localStorage.getItem('themeIndex'))||0
const themes=['theme1','theme2','theme3','theme4','dark']
let lastDeleted=null

document.body.classList.add(themes[themeIndex])
renderTodos(todos)

/* FORMAT TANGGAL: DD Bulan YYYY */
function formatDate(dateStr) {
  const months = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ]
  const [year, month, day] = dateStr.split("-")
  return `${day} ${months[month - 1]} ${year}`
}

form.addEventListener('submit',e=>{
  e.preventDefault()
  const title=titleInput.value.trim()
  const desc=descInput.value.trim()
  const date=dateInput.value
  if(!title||!desc||!date)return
  todos.push({title,desc,date,status:'pending'})
  saveTodos()
  form.reset()
  addSound.play()
})

function saveTodos(){
  localStorage.setItem('todos',JSON.stringify(todos))
  renderTodos(todos)
}

function renderTodos(list){
  todoList.innerHTML=''
  list.forEach((todo,i)=>{
    const li=document.createElement('li')
    li.draggable=true
    li.dataset.index=i
    li.classList.toggle('completed',todo.status==='completed')

    li.innerHTML=`
      <div class="info">
        <h3>${todo.title} <span class="badge ${todo.status}">${todo.status}</span></h3>
        <p>${todo.desc}</p>
        <small>${formatDate(todo.date)}</small>
      </div>
      <div class="actions">
        <button class="done">✅</button>
        <button class="edit">✎</button>
        <button class="delete">🗑️</button>
      </div>
    `

    todoList.appendChild(li)
    setTimeout(()=>li.classList.add('show'),50)

    const doneBtn=li.querySelector('.done')
    const editBtn=li.querySelector('.edit')
    const delBtn=li.querySelector('.delete')
    const infoBox=li.querySelector('.info')

    doneBtn.addEventListener('click',()=>{toggleStatus(i,li)})
    editBtn.addEventListener('click',()=>{editTodo(i)})
    delBtn.addEventListener('click',()=>{deleteTodo(i)})

    infoBox.addEventListener('mousedown',()=>{
      li.style.transform='scale(1.03)'
      li.style.boxShadow='0 8px 20px rgba(0,0,0,0.3)'
    })

    infoBox.addEventListener('mouseup',()=>{
      li.style.transform='scale(1)'
      li.style.boxShadow='none'
    })
  })
  addDragDrop()
  updateStats(list)
  checkAllDone(list)
}

function toggleStatus(i,li){
  todos[i].status=todos[i].status==='pending'?'completed':'pending'
  saveTodos()
  doneSound.play()
  li.classList.add('show')
}

function deleteTodo(i){
  lastDeleted={item:todos[i],index:i}
  undoText.textContent=`Tugas "${todos[i].title}" dihapus`
  undoBox.style.display='flex'
  setTimeout(()=>{undoBox.style.display='none'},4000)
  todos.splice(i,1)
  saveTodos()
  deleteSound.play()
}

undoBtn.addEventListener('click',()=>{
  if(lastDeleted){
    todos.splice(lastDeleted.index,0,lastDeleted.item)
    saveTodos()
    lastDeleted=null
    undoBox.style.display='none'
  }
})

function editTodo(i){
  const todo=todos[i]
  titleInput.value=todo.title
  descInput.value=todo.desc
  dateInput.value=todo.date
  todos.splice(i,1)
  saveTodos()
}

function updateStats(list){
  const totalCount=list.length
  const doneCount=list.filter(t=>t.status==='completed').length
  const pendingCount=totalCount-doneCount
  total.textContent=`Total: ${totalCount}`
  done.textContent=`Selesai: ${doneCount}`
  pending.textContent=`Pending: ${pendingCount}`
}

function checkAllDone(list){
  if(list.length>0 && list.every(t=>t.status==='completed')) confetti()
}

filterStatus.addEventListener('change',applyFilters)
searchInput.addEventListener('input',applyFilters)

clearFilter.addEventListener('click',()=>{
  filterStatus.value='all'
  searchInput.value=''
  renderTodos(todos)
})

function applyFilters(){
  let filtered=todos
  if(filterStatus.value!=='all')
    filtered=filtered.filter(t=>t.status===filterStatus.value)

  if(searchInput.value.trim()){
    const q=searchInput.value.toLowerCase()
    filtered=filtered.filter(t=>
      t.title.toLowerCase().includes(q)||
      t.desc.toLowerCase().includes(q)
    )
  }
  renderTodos(filtered)
}

clearAll.addEventListener('click',()=>{
  if(confirm('Hapus semua tugas?')){
    todos=[]
    saveTodos()
  }
})

themeToggle.addEventListener('click',()=>{
  document.body.classList.remove(themes[themeIndex])
  themeIndex=(themeIndex+1)%themes.length
  document.body.classList.add(themes[themeIndex])
  localStorage.setItem('themeIndex',themeIndex)
})

function addDragDrop(){
  const draggables=[...document.querySelectorAll('#todo-list li')]
  let dragStartIndex=null
  draggables.forEach(li=>{
    li.addEventListener('dragstart',()=>{dragStartIndex=+li.dataset.index})
    li.addEventListener('dragover',e=>e.preventDefault())
    li.addEventListener('drop',()=>{dragEnd(+li.dataset.index,dragStartIndex)})
  })
}

function dragEnd(toIndex,fromIndex){
  const item=todos.splice(fromIndex,1)[0]
  todos.splice(toIndex,0,item)
  saveTodos()
}

function confetti(){
  for(let i=0;i<150;i++){
    const div=document.createElement('div')
    div.style.position='fixed'
    div.style.width='6px'
    div.style.height='6px'
    div.style.background=`hsl(${Math.random()*360},100%,50%)`
    div.style.left=`${Math.random()*window.innerWidth}px`
    div.style.top=`0px`
    div.style.opacity=Math.random()
    div.style.zIndex=9999
    div.style.pointerEvents='none'
    div.style.transition='all 3s ease'
    document.body.appendChild(div)
    setTimeout(()=>{
      div.style.top=`${window.innerHeight}px`
      div.style.transform=`rotate(${Math.random()*720}deg)`
    },50)
    setTimeout(()=>div.remove(),3500)
  }
}
