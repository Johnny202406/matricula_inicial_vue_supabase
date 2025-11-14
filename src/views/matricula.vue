<script setup lang="ts">
import { ref, reactive } from "vue";
import { supabase } from '@/lib/supabaseClient';
import { Delete, Pencil, Plus, PlusCircle, X } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { faker } from "@faker-js/faker";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
// Definir los tipos de datos
interface Aula {
  id: number;
  nombre: string;
  edad: number;
  id_docente: number | null;
}

interface Estudiante {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  id_apoderado: number | null;
  apoderado: Apoderado | null;
}
export interface Apoderado {
  id: number
  dni: string
  nombre: string
  apellido: string
  numero: string
}
interface Matricula {
  id: number;
  id_aula: number;
  aula:Aula,
  id_estudiante: number;
  estudiante:Estudiante;
  fecha: string; // Puedes ajustar el tipo dependiendo de cómo quieras manejar la fecha
  precio: number;
}

// Estado reactivo
const matriculas = ref<Matricula[]>([]);
const aulas = ref<Aula[]>([]);
const estudiantes = ref<Estudiante[]>([]);
const searchByName = ref<string>('');
const isVisibleModal = ref(false);
const message = ref<string>('Empieza creando matrículas o eliminarlas');
const disabled = ref<boolean>(false);
const form = reactive({
  id_aula: null as null|number,
  id_estudiante: null as null|number,
  precio: null as null|number,
});
const selectedMatricula = ref<Matricula | null>(null);

// Función para cargar aulas desde la base de datos
const getAulas = async () => {
  const { data, error } = await supabase.from('aula').select('*');
  if (error) {
    console.error('Error al obtener aulas:', error);
    return;
  }
  aulas.value = data as Aula[] ?? [];
};

// Función para cargar estudiantes desde la base de datos
const getEstudiantes = async () => {
  const { data, error } = await supabase.from('estudiante').select('*');
  if (error) {
    console.error('Error al obtener estudiantes:', error);
    return;
  }
  estudiantes.value = data as Estudiante[] ?? [];
};
getAulas()
getEstudiantes()

// Función para cargar las matrículas desde la base de datos
const getMatriculas = async () => {
  message.value = 'Cargando matrículas...';

  let query = supabase
    .from('matricula')
    .select(`id, id_aula, id_estudiante, fecha, precio, aula(nombre), estudiante(nombre, apellido)`)
    .order('id', { ascending: false });

  // Filtro por nombre de estudiante si se ha proporcionado
  if (searchByName.value.trim() !== '') {
    query = query.ilike('estudiante.nombre', `%${searchByName.value.trim()}%`);
  }

  // Ejecutar la consulta
  const { data, error } = await query;

  if (error) {
    console.error(error);
    message.value = 'Ocurrió un error al cargar las matrículas. Recargue la página.';
    return;
  }

  matriculas.value = data as Matricula[] ?? [];
  message.value = `Se cargaron ${matriculas.value.length} matrículas.`;
};
// Función para eliminar una matrícula
const eliminarMatricula = async (id: number) => {
  const start = performance.now();
  disabled.value = true;
  message.value = `Eliminando matrícula con ID:${id}, espere...`;

  const { data, error } = await supabase.from('matricula').delete().eq('id', id).select('id');
  if (error) {
    disabled.value = false;
    message.value = `Ocurrió un error al eliminar la matrícula con ID:${id}. Intente de nuevo.`;
    return;
  }

  await getMatriculas();
  disabled.value = false;
  const end = performance.now();
  message.value = `Se eliminó la matrícula con ID:${id} en ${(end - start).toFixed(2)} ms`;
};

// Función para editar una matrícula
const editarMatricula = async (matricula: Matricula) => {
  console.log(matricula)
  selectedMatricula.value = matricula;
  form.id_aula = matricula.id_aula;
  form.id_estudiante = matricula.id_estudiante;
  form.precio = matricula.precio;
  isVisibleModal.value = true;
};

// Función para actualizar una matrícula
const actualizarMatricula = async () => {

  if(!selectedMatricula.value){
    return  crearMatriculaSupabase()
  }

  console.log("AQUI UPDATE")
  const start = performance.now();
  disabled.value = true;

  const { id_aula, id_estudiante, precio } = form;

  const { data, error } = await supabase
    .from('matricula')
    .update({ id_aula:Number(id_aula), id_estudiante:Number(id_estudiante), precio })
    .eq('id', selectedMatricula.value?.id as number)
    .select('id');

  if (error) {
    disabled.value = false;
    message.value = `Ocurrió un error al actualizar la matrícula con ID:${selectedMatricula.value?.id}. Intente de nuevo.`;
    return;
  }

  await getMatriculas();
  isVisibleModal.value = false;

  const end = performance.now();
  message.value = `Se actualizó la matrícula con ID:${selectedMatricula.value?.id} en ${(end - start).toFixed(2)} ms`;
  disabled.value = false;
};

// Función para crear una nueva matrícula
const crearMatriculas = async (number: number) => {
  // Verifica si tenemos aulas y estudiantes disponibles
  if (aulas.value.length === 0 || estudiantes.value.length === 0) {
    console.error('No hay aulas o estudiantes disponibles.');
    return;
  }

  const matriculasArray = [];

  for (let i = 0; i < number; i++) {
    // Seleccionar un aula y un estudiante aleatorio
    const randomEstudiante = estudiantes.value[Math.floor(Math.random() * estudiantes.value.length)];
    const randomAula = aulas.value[Math.floor(Math.random() * aulas.value.length)];

    // Crear la matrícula
    matriculasArray.push({
      id_estudiante: (randomEstudiante as Estudiante).id,
      id_aula: (randomAula as Aula).id,
      fecha: new Date().toISOString(), // La fecha de la matrícula es la fecha actual
      precio: faker.number.float({ min: 100, max: 500 }), // Asignamos un precio aleatorio entre 100 y 500
    });
  }

  // Insertar las matrículas en la base de datos
  const { data, error } = await supabase.from('matricula').insert(matriculasArray).select('id');

  if (error) {
    console.error('Error al crear matrículas:', error);
    return;
  }

  // Recargar las matrículas
  await getMatriculas();
  message.value = 'Matrículas creadas correctamente';
};
// Cerrar modal
const cerrarModal = () => {
  isVisibleModal.value = false;
  selectedMatricula.value=null
};

const crearMatri=()=>{
  selectedMatricula.value=null
  form.id_aula = null;
  form.id_estudiante = null;
  form.precio = null;
  isVisibleModal.value = true;
}
const crearMatriculaSupabase = async () => {
  const { id_aula, id_estudiante, precio } = form;
// Verificar si el estudiante ya tiene una matrícula en el aula
const { data: matriculaExistente, error: errorExistente } = await supabase
  .from('matricula')
  .select('id')
  .eq('id_estudiante', Number(id_estudiante))
  .single();



if (matriculaExistente) {
  message.value = 'Este estudiante ya está matriculado.';
  cerrarModal()
  return;
}

  // Verifica que los valores sean válidos antes de intentar insertar
  if (!id_aula || !id_estudiante || !precio) {
    message.value = 'Todos los campos deben estar completos.';
    return;
  }

  // Convierte los valores a números y asegura que no sean NaN
  const aulaId = Number(id_aula);
  const estudianteId = Number(id_estudiante);
  const precioValue = Number(precio);

  if (isNaN(aulaId) || isNaN(estudianteId) || isNaN(precioValue)) {
    message.value = 'Los valores deben ser numéricos.';
    return;
  }

  // Insertar la matrícula en la base de datos
  const { data, error } = await supabase
    .from('matricula')
    .insert([{
      fecha: new Date().toISOString(),
      id_aula: aulaId,
      id_estudiante: estudianteId,
      precio: precioValue
    }])
    .select('id');

  // Cerrar modal y manejar errores
  cerrarModal();
  if (error) {
    console.error('Error al crear matrícula:', error);
    message.value = 'Hubo un error al crear la matrícula.';
    return;
  }

  // Recargar las matrículas
  await getMatriculas();
  message.value = 'Matrícula creada correctamente';
};
; (async () => {
  getMatriculas();
})();


</script>
<template>
  <div class="relative">
    <h1>Matrículas</h1>

    <div class="box">
      <RouterLink to="/">Ir al dashboard</RouterLink>
      <span class="bg-(--cgv) p-2 rounded-sm text-white">{{ message }}</span>

      <!-- Barra de búsqueda -->
      <div class="grid md:grid-cols-2 md:gap-6" style="margin-bottom:10px;margin-top:10px;">
        <div class="relative z-0 w-full mb-5 group">
          <input type="text" name="search_name" id="search_name" v-model="searchByName"
            class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-(--cgv) focus:outline-none focus:ring-0 focus:border-(--cgv) peer"
            placeholder=" " required />
          <label for="search_name"
            class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-(--cgv) peer-focus:dark:text-(--cgv) peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
            Buscar por nombre de estudiante
          </label>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex gap-2 pb-2">
        <Button @click="getMatriculas()" :disabled="disabled" :variant="'outline'"
          class="hover:text-black w-36 bg-black border-(-cgv) border-0 text-(--cgv)">
          <Plus class="w-4 h-4 mr-2" />Buscar
        </Button>
        <Button @click="crearMatri()" :disabled="disabled" :variant="'outline'"
          class="hover:text-black w-36 bg-(--cgv) border-(--cgv) border-0 text-white">
          <Plus class="w-4 h-4 mr-2" />Crear Matricula
        </Button>
      </div>
    </div>

    <!-- Tabla de matrículas -->
    <Table>
      <TableCaption>Una lista de tus recientes matrículas.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead class="w-[100px]">Id</TableHead>
          <TableHead>Estudiante</TableHead>
          <TableHead>Aula</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead class="text-right">Opciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="matricula in matriculas" :key="matricula.id">
          <TableCell class="font-medium">{{ matricula.id }}</TableCell>
          <TableCell>{{ matricula.estudiante?.nombre || 'No asignado' }}</TableCell>
          <TableCell>{{ matricula.aula?.nombre || 'No asignado' }}</TableCell>
          <TableCell>{{ matricula.fecha }}</TableCell>
          <TableCell>{{ matricula.precio }}</TableCell>
          <TableCell class="text-right">
            <div class="flex gap-2">
              <!-- Eliminar matrícula -->
              <Button @click="eliminarMatricula(matricula.id)" :disabled="disabled" :variant="'outline'"
                class="hover:text-black w-auto bg-(--cgv) border-(--cgv) border-0 text-white">
                <Delete class="w-4 h-4 mr-2" />
              </Button>
              <!-- Editar matrícula -->
              <Button @click="editarMatricula(matricula)" :disabled="disabled" :variant="'outline'"
                class="hover:text-black w-auto bg-(--cgv) border-(--cgv) border-0 text-white">
                <Pencil class="w-4 h-4 mr-2" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <!-- Modal de edición -->
    <div v-if="isVisibleModal" class="container-modal absolute">
      <form @submit.prevent="actualizarMatricula" class="max-w-md mx-auto px-3 py-4 box-modal">
        <div class="grid md:grid-cols-2 md:gap-6" style="margin-bottom:10px;">
          <div class="relative z-0 w-full mb-5 group">
            <input type="number" v-model="form.precio"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-(--cgv) focus:outline-none focus:ring-0 focus:border-(--cgv) peer"
              required />
            <label for="nombre"
              class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-(--cgv) peer-focus:dark:text-(--cgv) peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
              Precio
            </label>
          </div>
        </div>
        <div class="grid md:grid-cols-2 md:gap-6" style="margin-bottom:10px;">
          <Select v-model="form.id_estudiante">
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un estudiante" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Aulas</SelectLabel>
                <SelectItem v-for="estudiante in estudiantes" :key="estudiante.id" :value="estudiante.id">
                  {{ estudiante.nombre }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          </div>
        <div class="grid md:grid-cols-2 md:gap-6" style="margin-bottom:10px;">
          <Select v-model="form.id_aula">
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un aula" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Aulas</SelectLabel>
                <SelectItem v-for="aula in aulas" :key="aula.id" :value="aula.id">
                  {{ aula.nombre }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div class="flex justify-end gap-2">
          <Button type="button" @click="cerrarModal"
            class="hover:text-black bg-red-600 text-white border-0">Cerrar</Button>
          <Button type="submit" :disabled="disabled" class="ml-2 hover:text-black bg-(--cgv) text-white border-0">Guardar
            cambios</Button>
        </div>
      </form>
    </div>
  </div>
</template>
