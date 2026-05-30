async function cargarDatos() {
  try {
    const res = await fetch("/revisiones_bachibac/data.json");
    const data = await res.json();
    console.log(data);
    return data
  } catch (error) {
    console.error(error);
    return error
  }
}

const data = await cargarDatos();

const materias = data.materias.filter((m) => { return (m.codigo === "HG" || m.codigo === "ES") })
const capitulos = data.capitulos.filter((c) => { return materias.some(m => m.id === c.materiaId) })
const flashcards = data.tarjetas.filter((f) => { return capitulos.some(c => c.id === f.capituloId) })
const playground = document.getElementById("playground")

let fsID = []
let i = 0
export function materiasPlayground() {
  fsID = []
  i = 0
  let materiasHTML = ""

  materias.map((x) => {
    materiasHTML += `
        <button class="btn btn-primary rounded w-100 my-2" onclick="f.capitulosPlayground('${x.id}')">${x.nombre}</button>
      `
  })

  playground.innerHTML = `
    <div class="card col-12">
      <div class="row align-content-center card-header m-0">
        <span class="col align-content-center fw-bold"><i class="fa fa-book-bookmark"></i> Materias</span>
      </div>
      <div class="card-body">
        ${materiasHTML}
      </div>
    </div>`
}

export function capitulosPlayground(mid) {
  let capitulosHTML = ""

  capitulos.map((x) => {
    if (x.materiaId === mid) {
      capitulosHTML += `
          <button class="btn btn-primary rounded w-100 my-2" onclick="f.flashcardsPlayground('${x.id}')">${x.nombre}</button>
        `
    }
  })
  playground.innerHTML = `
    <div class="card col-12">
      <div class="row align-content-center card-header m-0">
        <div class="col-auto">
          <button class="btn btn-primary rounded-circle p-2" style="width: 3rem; height: 3rem;" onclick="f.materiasPlayground()"><i class="fa fa-angle-left"></i></button>
        </div>
        <span class="col align-content-center fw-bold"><i class="fa fa-book-book"></i> Capitulos de ${(materias.filter(x => { return x.id === mid }))[0].nombre}</span>
      </div>
      <div class="card-body">
        ${capitulosHTML}
      </div>
    </div>`
}

export function flashcardsPlayground(cid) {
  let flashcardsHTML = ""

  const fs = flashcards.filter((x) => { return x.capituloId === cid })

  fs.map((x) => {
    fsID.push(x.id)
    flashcardsHTML += `<button id="${x.id}" onclick="f.voltear();this.classList.toggle('flipped')" class="flashcard py-5 btn bg-primary-subtle rounded-0 w-100 h-100 d-none pregunta">${x.pregunta}</button>`
  })

  playground.innerHTML = `
    <div class="card h-100 col-12">
      <div class="progress col-12" role="progressbar" aria-label="progreso" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar" id="progress">0%</div>
      </div>
      <div class="row align-content-center card-header m-0">
        <div class="col-auto align-content-center">
          <button class="btn btn-primary rounded-circle p-2" style="width: 3rem; height: 3rem;" onclick="f.materiasPlayground()"><i class="fa fa-home"></i></button>
        </div>
        <span class="col align-content-center fw-bold"><i class="fa fa-brain"> </i>Estudiando <br/>${capitulos.filter((x) => { return x.id === cid })[0].nombre}</span>
        <div class="col-12 mt-2">
          <i class="fa fa-eye"></i>
          <span class="small" id="message">Toca para ver respuesta</span>
        </div>
      </div>
      <div class="card-body p-0 h-100">
        ${flashcardsHTML}
      </div>
      <div class="card-footer">
        <div class="row">
          <button class="btn btn-success" onclick="f.siguiente()">Siguiente pregunta <i class="fa fa-people-pulling"></i></button>
        </div>
      </div>
    </div>`
  document.getElementById(fsID[0]).classList.remove("d-none")
}

export function voltear() {
  const fHTML = document.getElementById(fsID[i])
  const message = document.getElementById("message")
  const f = flashcards.filter(x => { return x.id === fsID[i] })[0]
  if (fHTML.classList.contains("pregunta")) {
    fHTML.classList.replace("pregunta", "respuesta")
    fHTML.classList.replace("bg-primary-subtle", "bg-success-subtle")
    fHTML.innerText = f.respuesta
    message.innerText = "Toca para ver pregunta"
  } else {
    fHTML.classList.replace("respuesta", "pregunta")
    fHTML.classList.replace("bg-success-subtle", "bg-primary-subtle")
    fHTML.innerText = f.pregunta
    message.innerText = "Toca para ver respuesta"
  }
}
export function siguiente() {
  if (i < fsID.length - 1) {
    i += 1
    document.getElementById(fsID[i - 1]).classList.add("d-none")
    document.getElementById(fsID[i]).classList.remove("d-none")
    document.getElementById("message").innerText = "Toca para ver respuesta"
    console.log(i, fsID.length);

    document.getElementById("progress").style.width = `${(i / fsID.length * 100)}%`
    document.getElementById("progress").innerText = `${(i / fsID.length * 100).toPrecision(2)}%`
  } else {
    playground.innerHTML = `
    <div class="card h-100 col-12">
      <div class="progress col-12" role="progressbar" aria-label="progreso" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar bg-success" id="progress" style="width: 100%;">100%</div>
      </div>
      <div class="card-body p-0">
        <div class="col align-content-center w-100 h-100 bg-success-subtle text-success-emphasis text-center">
          <i class="fa fa-check fa-3x my-3"></i>
          <h1>Terminaste capitulo blablabla</h1>
        </div>
      </div>
      <div class="card-footer">
        <div class="row">
          <button class="btn btn-success" onclick="f.materiasPlayground()"><i class="fa fa-graduation-cap"></i> Seguir estudiando otro capitulo</button>
        </div>
      </div>
    </div>`
  }
}

materiasPlayground()