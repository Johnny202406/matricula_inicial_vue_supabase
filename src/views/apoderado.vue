

<template>
  <div class="relative">
    <h1>APODERADOS</h1>
    <div class="box">
      <RouterLink to="/">Ir al dashboard</RouterLink>
      <span class="message">{{ message }}</span>
      <div class="grid md:grid-cols-2 md:gap-6" style="margin-bottom:10px;margin-top:10px;">
        <div class="relative z-0 w-full mb-5 group">
          <input type="text" name="floating_first_name" id="floating_first_name" v-model="searchByName"
            class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" " required />
          <label for="floating_first_name"
            class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
            Buscar por nombre</label>
        </div>
      </div>
      <button
        class="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 disabled:bg-gray-400" style="width:100px"
        @click="getApoderados()" :disabled="disabled">Buscar</button>
      <div class="row mx-3">

        <button class="btn" @click="crearApoderados(1)" :disabled="disabled">CREAR 1 APODERADO</button>
        <button class="btn" @click="crearApoderados(5)" :disabled="disabled">CREAR 5 APODERADOS</button>
      </div>
    </div>


    <div class=" overflow-x-auto tb">
      <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" class="px-6 py-3">ID</th>
            <th scope="col" class="px-6 py-3">DNI</th>
            <th scope="col" class="px-6 py-3">Nombre</th>
            <th scope="col" class="px-6 py-3">Apellido</th>
            <th scope="col" class="px-6 py-3">Número</th>
            <th scope="col" class="px-6 py-3">Opciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in apoderados" :key="index"
            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
              {{ item.id }}
            </th>
            <td class="px-6 py-4">{{ item.dni }}</td>
            <td class="px-6 py-4">{{ item.nombre }}</td>
            <td class="px-6 py-4">{{ item.apellido }}</td>
            <td class="px-6 py-4">{{ item.numero }}</td>
            <td class="px-6 py-4">
              <div class="flex gap-2" style="gap:8px">
                <button
                  class="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 disabled:bg-gray-400"
                  @click="editarApoderado(item)" :disabled="disabled">Editar</button>
                <button
                  class="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600 disabled:bg-gray-400"
                  @click="eliminarApoderado(item.id)" :disabled="disabled">
                  Eliminar
                </button>
              </div>
            </td>

          </tr>
        </tbody>
      </table>
    </div>
    <!-- FORMULARIO -->
    <div class="container-modal absolute" v-if="isVisibleModal">
      <form @submit.prevent="actualizarEnSupa" class="max-w-md mx-auto  px-3 py-4 box-modal">

        <div class="grid md:grid-cols-2 md:gap-6" style="margin-bottom:10px">
          <div class="relative z-0 w-full mb-5 group">
            <input type="text" name="floating_first_name" id="floating_first_name" v-model="form.nombre"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" " required />
            <label for="floating_first_name"
              class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
              Nombre</label>
          </div>
          <div class="relative z-0 w-full mb-5 group">
            <input type="text" name="floating_last_name" id="floating_last_name" v-model="form.apellido"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" " required />
            <label for="floating_last_name"
              class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
              Apellido</label>
          </div>
        </div>
        <div class="grid md:grid-cols-2 md:gap-6" style="margin-bottom:10px">
          <div class="relative z-0 w-full mb-5 group">
            <input type="text" name="floating_phone" id="floating_phone" v-model="form.numero"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" " required />
            <label for="floating_phone"
              class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Número
              (987654321)</label>
          </div>
          <div class="relative z-0 w-full mb-5 group">
            <input type="text" name="floating_company" id="floating_company" v-model="form.dni"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" " required />
            <label for="floating_company"
              class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Dni
              (87564321)</label>
          </div>
        </div>
        <button type="submit"
          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Actualizar</button>
        <span class="px-5"></span>
        <button type="button"
          class="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          @click="cerrarModal()">Cancelar</button>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { supabase } from '@/lib/supabaseClient'
import { fakerES_MX as faker } from '@faker-js/faker'
import { ref } from 'vue'
import { reactive } from 'vue'
export interface Apoderado {
  id: number
  dni: string
  nombre: string
  apellido: string
  numero: string
}

const form = reactive({
  nombre: '',
  apellido: '',
  numero: '',
  dni: '',
})

const searchByName = ref<string>('')

const apoderados = ref()
const isVisibleModal = ref(false)
const message = ref<string>('Empieze creando apoderados o elimine')
const disabled = ref<boolean>(false)
const getApoderados = async () => {
  message.value = 'Cargando apoderados...'

  // 🔹 Base query
  let query = supabase
    .from('apoderado')
    .select('*')
    .order('id', { ascending: false })

  // 🔹 Si hay texto en searchByName, aplicamos filtro LIKE
  if (searchByName.value.trim() !== '') {
    query = query.ilike('nombre', `%${searchByName.value.trim()}%`)
  }

  // 🔹 Ejecutar la consulta
  const { data, error } = await query

  if (error) {
    console.error(error)
    message.value = 'Ocurrió un error al traer los apoderados, recargue la página'
    return
  }

  apoderados.value = data ?? []
  message.value = `Se cargaron ${apoderados.value.length} apoderados`
  console.log('Apoderados:', data)
}
  ; (async () => {
    await getApoderados()
  })()

const crearApoderados = async (number: number) => {
  const start = performance.now()
  message.value = `Creando ${number} apoderados..., espere`
  disabled.value = true
  const apoderados = []

  for (let index = 0; index < number; index++) {
    apoderados.push({
      dni: faker.string.numeric(8),
      nombre: faker.person.firstName(),
      apellido: faker.person.lastName(),
      numero: '9' + faker.string.numeric(8)
    })
  }
  const { data, error } = await supabase.from('apoderado').insert(apoderados).select('id')
  if (error) {
    disabled.value = false
    message.value = `Ocurrio un error al crear el ${number} apoderados, intente de nuevo`
    return
  }

  await getApoderados()
  disabled.value = false
  const end = performance.now()
  message.value = `Se creo ${number} producto(s) en ${end - start} ms`
  return
}

const selectedApoderado = ref<Apoderado>()
const editarApoderado = async (apoderado: Apoderado) => {
  selectedApoderado.value = apoderado
  form.nombre = apoderado.nombre
  form.apellido = apoderado.apellido
  form.numero = apoderado.numero
  form.dni = apoderado.dni
  isVisibleModal.value = true

}
const actualizarEnSupa = async () => {
  const start = performance.now()
  disabled.value = true
  const { nombre, apellido, numero, dni } = form

  // 🔹 Actualizar el registro en Supabase
  const { data, error } = await supabase
    .from('apoderado')
    .update({
      nombre,
      apellido,
      numero,
      dni
    })
    .eq('id', selectedApoderado.value?.id)
    .select('id')

  // 🔻 Manejo de error
  if (error) {
    disabled.value = false

    message.value = `Ocurrió un error al actualizar el apoderado con ID:${selectedApoderado.value?.id}, intente de nuevo`
    return
  }
  isVisibleModal.value = false
  // 🔄 Refrescamos los datos
  await getApoderados()


  const end = performance.now()

  message.value = `Se actualizó el apoderado con ID:${selectedApoderado.value?.id} en ${(end - start).toFixed(2)} ms`
  disabled.value = false

}


const eliminarApoderado = async (id: number) => {
  const start = performance.now()
  message.value = `Eliminando producto con ID:${id} ..., espere`
  disabled.value = true
  const { data, error } = await supabase.from('apoderado').delete().eq('id', id).select('id')
  if (error) {
    disabled.value = false
    message.value = `Ocurrio un error al eliminar el producto con ID:${id}, intente de nuevo`
    return
  }

  await getApoderados()
  disabled.value = false
  const end = performance.now()
  message.value = `Se elimino el producto con ID:${id} en ${end - start} ms`
  return
}

const cerrarModal = () => {
  isVisibleModal.value = false
}
</script>
<style  >
@import "tailwindcss";

.message {
  display: inline-block;
  padding: 6px 12px;
  background-color: #42b983;
  /* color principal estilo Vue */
  color: white;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s;
}

.message:hover {
  background-color: #369870;
  /* más oscuro al pasar el mouse */
}

.row {
  display: flex;
  gap: 10px;
}

.box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tb {
  margin-top: 20px;
  width: 100%;
}

.btn {
  width: max-content;
  background-color: #1f2937;
  color: #e5e7eb;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.1s;
}

.btn:hover {
  background-color: #374151;
  transform: translateY(-2px);
}

.btn:active {
  transform: scale(0.97);
}

.btn:disabled {
  background-color: #cbd5e1;
  color: #64748b;
  border: 1px solid #94a3b8;
  cursor: not-allowed;
  opacity: 0.7;
  pointer-events: none;
}

.container-modal {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  background: #64748b;
}

.box-modal {
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 1rem 2rem;
  border-radius: 8px;
  background: #1f2937;
}
</style>
