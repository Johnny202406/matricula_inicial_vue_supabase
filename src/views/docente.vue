<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ref } from "vue"
import { Delete, Pencil, Plus, PlusCircle, X } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
const invoices = ref([])
import { supabase } from '@/lib/supabaseClient'
import { fakerES_MX as faker } from '@faker-js/faker'
import { reactive } from 'vue'

import { toTypedSchema } from "@vee-validate/zod"
import { h } from "vue"
import * as z from "zod"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
const formSchema = toTypedSchema(z.object({
  username: z.string().min(2).max(50),
}))

function onSubmit(values: any) {

}
export interface Docente {
  id: number
  dni: string
  nombre: string
  apellido: string
  numero: string
}

const form = reactive({
  nombre: null as null | string,
  apellido: null as null | string,
  numero: null as null | number,
  dni: null as null | number,
})

const searchByName = ref<string>('')
const selectedNumber = ref<number>(5)

const docentes = ref<Docente[]>([])
const isVisibleModal = ref(false)
const message = ref<string>('Empieze creando docentes o elimine')
const disabled = ref<boolean>(false)

const crearDocentes = async (number: number) => {
  const start = performance.now()
  message.value = `Creando ${number} docentes..., espere`
  disabled.value = true
  const docentes = []

  for (let index = 0; index < number; index++) {
    docentes.push({
      dni: faker.string.numeric(8),
      nombre: faker.person.firstName(),
      apellido: faker.person.lastName(),
      numero: '9' + faker.string.numeric(8)
    })
  }
  const { data, error } = await supabase.from('docente').insert(docentes).select('id')
  if (error) {
    disabled.value = false
    message.value = `Ocurrio un error al crear el ${number} docentes, intente de nuevo`
    return
  }

  await getDocentes()
  disabled.value = false
  const end = performance.now()
  message.value = `Se creo ${number} producto(s) en ${end - start} ms`
  return
}

const getDocentes = async () => {
  message.value = 'Cargando docentes...'

  // 🔹 Base query
  let query = supabase
    .from('docente')
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
    message.value = 'Ocurrió un error al traer los docentes, recargue la página'
    return
  }

  docentes.value = data as Docente[] ?? []
  message.value = `Se cargaron ${docentes.value.length} docentes`
  console.log('docentes:', data)
}
  ; (async () => {
    await getDocentes()
  })()



const selectedDocente = ref<Docente>()
const editardocente = async (docente: Docente) => {
  selectedDocente.value = docente
  form.nombre = docente.nombre
  form.apellido = docente.apellido
  form.numero = Number(docente.numero)
  form.dni = Number(docente.dni)
  isVisibleModal.value = true

}
const actualizarEnSupa = async () => {
   if (!selectedDocente.value) {
    return crearDocenteSupabase()
  }
  const start = performance.now()
  disabled.value = true
  const { nombre, apellido, numero, dni } = form

  // 🔹 Actualizar el registro en Supabase
  const { data, error } = await supabase
    .from('docente')
    .update({
      nombre,
      apellido,
      numero:(numero as number).toString(),
      dni:(numero as number).toString()
    })
    .eq('id', selectedDocente.value?.id as number)
    .select('id')

  // 🔻 Manejo de error
  if (error) {
    disabled.value = false

    message.value = `Ocurrió un error al actualizar el docente con ID:${selectedDocente.value?.id}, intente de nuevo`
    return
  }
  isVisibleModal.value = false
  // 🔄 Refrescamos los datos
  await getDocentes()


  const end = performance.now()

  message.value = `Se actualizó el docente con ID:${selectedDocente.value?.id} en ${(end - start).toFixed(2)} ms`
  disabled.value = false

}


const eliminardocente = async (id: number) => {
  const start = performance.now()
  disabled.value = true
  message.value = `Eliminando docente con ID:${id} ..., espere`
  const { data, error } = await supabase.from('docente').delete().eq('id', id).select('id')
  if (error) {
    disabled.value = false
    message.value = `Ocurrio un error al eliminar el docente con ID:${id}, intente de nuevo`
    return
  }

  await getDocentes()
  disabled.value = false
  const end = performance.now()
  message.value = `Se elimino el docente con ID:${id} en ${end - start} ms`
  return
}


// Cerrar modal
const cerrarModal = () => {
  isVisibleModal.value = false;
  selectedDocente.value = undefined
};

const crearDocente= () => {
  selectedDocente.value = undefined
  form.nombre = null;
  form.apellido = null;
  form.numero = null;
  form.dni = null;
  isVisibleModal.value = true;
}
const crearDocenteSupabase = async () => {
  const { nombre, apellido, dni, numero } = form;

  // Insertar la matrícula en la base de datos
  const { data, error } = await supabase
    .from('docente')
    .insert([{
      nombre,
      apellido,
      dni: dni?.toString(),
      numero: numero?.toString(),
    }])
    .select('id');

  // Cerrar modal y manejar errores
  cerrarModal();
  if (error) {
    console.error('Error al crear Docente:', error);
    message.value = 'Hubo un error al crear la Docente.';
    return;
  }

  // Recargar las matrículas
  await getDocentes();
  message.value = 'Docente creada correctamente';
};
</script>

<template>
  <div class="relative">
    <h1>DOCENTES</h1>
    <div class="box">
      <RouterLink to="/">Ir al dashboard</RouterLink>
      <span class="bg-(--cgv) p-2 rounded-sm text-white">{{ message }}</span>
      <div class="grid md:grid-cols-2 md:gap-6" style="margin-bottom:10px;margin-top:10px;">
        <div class="relative z-0 w-full mb-5 group">
          <input type="text" name="floating_first_name" id="floating_first_name" v-model="searchByName"
            class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-(--cgv) focus:outline-none focus:ring-0 focus:border-(--cgv) peer"
            placeholder=" " required />
          <label for="floating_first_name"
            class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-(--cgv) peer-focus:dark:text-(--cgv) peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
            Buscar por nombre</label>
        </div>
      </div>



      <Button @click="getDocentes()" :disabled="disabled" :variant="'outline'"
        class="hover:text-black w-36 bg-black border-(-cgv) border-0 text-(--cgv)">
        <Plus class="w-4 h-4 mr-2" />Buscar
      </Button>
      <div class="flex gap-2 pb-2">
          <Button @click="crearDocente()" :disabled="disabled" :variant="'outline'"
          class="hover:text-black w-36 bg-(--cgv) border-(--cgv) border-0 text-white">
          <Plus class="w-4 h-4 mr-2" />Crear Docente
        </Button>
        <!-- <Button @click="crearDocentes(1)" :disabled="disabled" :variant="'outline'"
          class="hover:text-black w-36 bg-(--cgv) border-(--cgv) border-0 text-white">
          <Plus class="w-4 h-4 mr-2" />Crear 1 docente
        </Button>
        <Button @click="crearDocentes(5)" :disabled="disabled" :variant="'outline'"
          class="hover:text-black w-36 bg-(--cgv) border-(--cgv) border-0 text-white">
          <PlusCircle class="w-4 h-4 mr-2" />Crear 5 docente
        </Button> -->
      </div>





    </div>
    <Table>
      <TableCaption>Una lista de tus recientes docentes.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead class="w-[100px]">
            Id
          </TableHead>
          <TableHead>Dni</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Apellido</TableHead>
          <TableHead>Número</TableHead>
          <TableHead class="text-right">
            Opciones
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="docente in docentes" :key="docente.id">
          <TableCell class="font-medium">
            {{ docente.id }}
          </TableCell>
          <TableCell>{{ docente.dni }}</TableCell>
          <TableCell>{{ docente.nombre }}</TableCell>
          <TableCell>{{ docente.apellido }}</TableCell>
          <TableCell>{{ docente.numero }}</TableCell>
          <TableCell class="text-right">
            <div class="flex gap-2">
              <Button @click="eliminardocente(docente.id)" :disabled="disabled" :variant="'outline'"
                class="hover:text-black w-auto bg-(--cgv) border-(--cgv) border-0 text-white">
                <Delete class="w-4 h-4 mr-2" />
              </Button>
              <Button @click="editardocente(docente)" :disabled="disabled" :variant="'outline'"
                class="hover:text-black w-auto bg-(--cgv) border-(--cgv) border-0 text-white">
                <Pencil class="w-4 h-4 mr-2" />
              </Button>
            </div>

          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
      <Pagination v-slot="{ page }" :items-per-page="10" :total="30" :default-page="2">
    <PaginationContent v-slot="{ items }">
      <PaginationPrevious />

      <template v-for="(item, index) in items" :key="index">
        <PaginationItem
          v-if="item.type === 'page'"
          :value="item.value"
          :is-active="item.value === page"
          class="text-(--cgv)"
        >
          {{ item.value }}
        </PaginationItem>
      </template>

      <PaginationEllipsis :index="4" />

      <PaginationNext />
    </PaginationContent>
  </Pagination>
  <Select v-model="selectedNumber">
        <SelectTrigger class="w-[180px]">
          <SelectValue  v-model="selectedNumber"/>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <!-- Solo las opciones 5, 10 y 15 -->
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="15">15</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    <!-- FORMULARIO -->
    <div class="container-modal absolute" v-if="isVisibleModal">
      <form @submit.prevent="actualizarEnSupa" class="max-w-md mx-auto  px-3 py-4 box-modal">

        <div class="grid md:grid-cols-2 md:gap-6" style="margin-bottom:10px">
          <div class="relative z-0 w-full mb-5 group">
            <input type="text" name="floating_first_name" id="floating_first_name" v-model="form.nombre"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-(--cgv) focus:outline-none focus:ring-0 focus:border-(--cgv) peer"
              placeholder=" " required />
            <label for="floating_first_name"
              class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-(--cgv) peer-focus:dark:text-(--cgv) peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
              Nombre</label>
          </div>
          <div class="relative z-0 w-full mb-5 group">
            <input type="text" name="floating_last_name" id="floating_last_name" v-model="form.apellido"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-(--cgv) focus:outline-none focus:ring-0 focus:border-(--cgv) peer"
              placeholder=" " required />
            <label for="floating_last_name"
              class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-(--cgv) peer-focus:dark:text-(--cgv) peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
              Apellido</label>
          </div>
        </div>
        <div class="grid md:grid-cols-2 md:gap-6" style="margin-bottom:10px">
          <div class="relative z-0 w-full mb-5 group">
            <input type="number" name="floating_phone" id="floating_phone" v-model="form.numero"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-(--cgv) focus:outline-none focus:ring-0 focus:border-(--cgv)peer"
              placeholder=" " required />
            <label for="floating_phone"
              class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-(--cgv) peer-focus:dark:text-(--cgv) peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Número
              (987654321)</label>
          </div>
          <div class="relative z-0 w-full mb-5 group">
            <input type="number" name="floating_company" id="floating_company" v-model="form.dni"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-(--cgv) focus:outline-none focus:ring-0 focus:border-(--cgv) peer"
              placeholder=" " required />
            <label for="floating_company"
              class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-(--cgv) peer-focus:dark:text-(--cgv) peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Dni
              (87564321)</label>
          </div>
        </div>
        <button type="submit"
          class="text-white bg-(--cgv) hover:bg-(--cgv) focus:ring-4 focus:outline-none focus:ring-(--cgv) font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-(--cgv) dark:hover:bg-(--cgv) dark:focus:ring-(--cgv)">Actualizar</button>
        <span class="px-5"></span>
        <Button @click="cerrarModal()" :variant="'outline'"
          class="hover:text-black w-36 bg-black border-(-cgv) border-0 text-white">
          <X class="w-4 h-4 mr-2" />Cancelar
        </Button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
