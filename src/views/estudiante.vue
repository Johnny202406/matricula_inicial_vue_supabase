<script setup lang="ts">
import { ref, reactive } from "vue";
import { supabase } from '@/lib/supabaseClient';
import { Delete, Download, Pencil, Plus, PlusCircle, X } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { faker } from "@faker-js/faker";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { jsPDF } from "jspdf";
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
interface Apoderado {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
}

interface Estudiante {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  id_apoderado: number | null;
  apoderado: Apoderado | null; // Relación con apoderado
}
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
const estudiantes = ref<Estudiante[]>([]);
const searchByName = ref<string>('');
const selectedNumber = ref<number>(5);
const isVisibleModal = ref(false);
const message = ref<string>('Empieza creando estudiantes o eliminarlos');
const disabled = ref<boolean>(false);
const form = reactive({
  nombre: null as null|string,
  apellido: null as null|string,
  dni: null as null|number,
  apoderado: null as null|number
});
const apoderados = ref<Apoderado[]>([]);
const selectedEstudiante = ref<Estudiante | null>(null);

const getApoderados = async () => {
  const { data, error } = await supabase.from('apoderado').select('*');
  if (error) {
    console.error('Error al obtener apoderados:', error);
    return;
  }
  apoderados.value = data as Apoderado[] ?? [];
};

// Función para crear estudiantes con apoderados aleatorios
const crearEstudiantes = async (number: number) => {
  // Asegúrate de que haya apoderados antes de continuar
  if (apoderados.value.length === 0) {
    console.error('No hay apoderados disponibles.');
    return;
  }

  const estudiantesArray = [];

  for (let i = 0; i < number; i++) {
    // Seleccionamos un apoderado aleatorio
    const randomApoderado = apoderados.value[Math.floor(Math.random() * apoderados.value.length)];

    estudiantesArray.push({
      dni: faker.string.numeric(8),
      nombre: faker.person.firstName(),
      apellido: faker.person.lastName(),
      id_apoderado: (randomApoderado as Apoderado).id, // Relacionamos el apoderado al estudiante
    });
  }

  const { data, error } = await supabase.from('estudiante').insert(estudiantesArray).select('id');

  if (error) {
    console.error('Error al crear estudiantes:', error);
    return;
  }

  await getEstudiantes(); // Cargar los estudiantes después de la creación
};

// Función para cargar estudiantes desde la base de datos
const getEstudiantes = async () => {
  message.value = 'Cargando estudiantes...';

  // Consulta con la relación a la tabla 'apoderado'
  let query = supabase
    .from('estudiante')
    .select(`
      id, dni, nombre, apellido, id_apoderado,
      apoderado (id, dni, nombre, apellido)  // Relacionamos 'apoderado' y obtenemos los campos deseados
    `)
    .order('id', { ascending: false });

  // Filtro por nombre si se ha proporcionado
  if (searchByName.value.trim() !== '') {
    query = query.ilike('nombre', `%${searchByName.value.trim()}%`);
  }

  // Ejecutar la consulta
  const { data, error } = await query;

  if (error) {
    console.error(error);
    message.value = 'Ocurrió un error al cargar los estudiantes. Recargue la página.';
    return;
  }

  // Asignamos los datos a 'estudiantes'
  estudiantes.value = data as unknown as Estudiante[] ?? [];
  message.value = `Se cargaron ${estudiantes.value.length} estudiantes.`;
};

// Función para eliminar un estudiante
const eliminarEstudiante = async (id: number) => {
  const start = performance.now();
  disabled.value = true;
  message.value = `Eliminando estudiante con ID:${id}, espere...`;

  const { data, error } = await supabase.from('estudiante').delete().eq('id', id).select('id');
  if (error) {
    disabled.value = false;
    message.value = `Ocurrió un error al eliminar el estudiante con ID:${id}. Intente de nuevo.`;
    return;
  }

  await getEstudiantes();
  disabled.value = false;
  const end = performance.now();
  message.value = `Se eliminó el estudiante con ID:${id} en ${(end - start).toFixed(2)} ms`;
};

// Función para editar un estudiante
const editarEstudiante = async (estudiante: Estudiante) => {
  selectedEstudiante.value = estudiante;
  form.nombre = estudiante.nombre;
  form.apellido = estudiante.apellido;
  form.dni = Number(estudiante.dni);
  form.apoderado =( estudiante.apoderado as Apoderado).id;
  isVisibleModal.value = true;
};

// Función para actualizar un estudiante
const actualizarEstudiante = async () => {
    if (!selectedEstudiante.value) {
    return crearEstudianteSupabase()
  }
  const start = performance.now();
  disabled.value = true;

  const { nombre, apellido, dni,apoderado } = form;

  const { data, error } = await supabase
    .from('estudiante')
    .update({ nombre, apellido, dni:(dni as number).toString() ,id_apoderado: Number(apoderado)})
    .eq('id', selectedEstudiante.value?.id as number)
    .select('id');

  if (error) {
    disabled.value = false;
    message.value = `Ocurrió un error al actualizar el estudiante con ID:${selectedEstudiante.value?.id}. Intente de nuevo.`;
    return;
  }

  await getEstudiantes();
  isVisibleModal.value = false;

  const end = performance.now();
  message.value = `Se actualizó el estudiante con ID:${selectedEstudiante.value?.id} en ${(end - start).toFixed(2)} ms`;
  disabled.value = false;
};



const descargarMatricula = async (idEstudiante: number) => {
  // Verificar si el estudiante tiene alguna matrícula
  const { data: matriculas, error } = await supabase
    .from('matricula')
    .select(`
      id, fecha,
      aula (nombre),
      estudiante (nombre),
      precio
    `)
    .eq('id_estudiante', idEstudiante)
    .order('fecha', { ascending: false }) // Traemos la más reciente
    .limit(1); // Solo la última matrícula

  if (error || !matriculas.length) {
    message.value='No se encontraron matrículas para este estudiante.';
    return;
  }

  // Obtener la última matrícula
  const matricula = matriculas[0];

  // Crear un nuevo documento PDF
  const doc = new jsPDF();

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`Matrícula del Estudiante: ${idEstudiante}`, 20, 20);

  // Información de la matrícula
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Nombre: ${(matricula as Matricula).estudiante.nombre}`,20,30);
  doc.text(`Aula: ${(matricula as Matricula).aula.nombre}`, 20, 40);
  doc.text(`Fecha de Matrícula: ${new Date((matricula as Matricula).fecha).toLocaleDateString()}`, 20, 50);
  doc.text(`Precio: PEN${(matricula as Matricula).precio} `, 20, 60);

  // Descargar el archivo PDF
  doc.save(`matricula_${idEstudiante}.pdf`);

};

// Inicializar datos de estudiantes al cargar el componente
(async () => {
   getEstudiantes();
getApoderados()

})();
// Cerrar modal
const cerrarModal = () => {
  isVisibleModal.value = false;
  selectedEstudiante.value=null
};

const crearEstudiante=()=>{
  selectedEstudiante.value=null
  form.nombre = null;
  form.apellido = null;
  form.dni = null;
  form.apoderado = null;

  isVisibleModal.value = true;
}
const crearEstudianteSupabase = async () => {
  const { nombre, apellido, dni,apoderado } = form;
  // Insertar la matrícula en la base de datos
  const { data, error } = await supabase
    .from('estudiante')
    .insert([{
      nombre,
      apellido,
      dni:(dni as number).toString(),
      id_apoderado:apoderado

    }])
    .select('id');

  // Cerrar modal y manejar errores
  cerrarModal();
  if (error) {
    console.error('Error al crear Estudiante:', error);
    message.value = 'Hubo un error al crear la Estudiante.';
    return;
  }

  // Recargar las matrículas
  await getEstudiantes();
  message.value = 'Estudiante creada correctamente';
};
</script>
<template>
  <div class="relative">
    <h1>Estudiantes</h1>

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
            Buscar por nombre
          </label>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex gap-2 pb-2">
        <Button @click="getEstudiantes()" :disabled="disabled" :variant="'outline'"
          class="hover:text-black w-36 bg-black border-(-cgv) border-0 text-(--cgv)">
          <Plus class="w-4 h-4 mr-2" />Buscar
        </Button>

        <Button @click="crearEstudiante()" :disabled="disabled" :variant="'outline'"
          class="hover:text-black w-36 bg-(--cgv) border-(--cgv) border-0 text-white">
          <Plus class="w-4 h-4 mr-2" />Crear 1 estudiante
        </Button>

        <!-- <Button @click="crearEstudiantes(1)" :disabled="disabled" :variant="'outline'"
          class="hover:text-black w-36 bg-(--cgv) border-(--cgv) border-0 text-white">
          <Plus class="w-4 h-4 mr-2" />Crear 1 estudiante
        </Button>
        <Button @click="crearEstudiantes(5)" :disabled="disabled" :variant="'outline'"
          class="hover:text-black w-36 bg-(--cgv) border-(--cgv) border-0 text-white">
          <PlusCircle class="w-4 h-4 mr-2" />Crear 5 estudiantes
        </Button> -->
      </div>
    </div>

    <!-- Tabla de estudiantes -->
    <Table>
      <TableCaption>Una lista de tus recientes estudiantes.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead class="w-[100px]">Id</TableHead>
          <TableHead>Dni</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Apellido</TableHead>
          <TableHead>Apoderado</TableHead>
          <TableHead class="text-right">Opciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="estudiante in estudiantes" :key="estudiante.id">
          <TableCell class="font-medium">{{ estudiante.id }}</TableCell>
          <TableCell>{{ estudiante.dni }}</TableCell>
          <TableCell>{{ estudiante.nombre }}</TableCell>
          <TableCell>{{ estudiante.apellido }}</TableCell>
          <TableCell>{{ estudiante.apoderado?.nombre || 'No asignado' }}</TableCell>
          <TableCell class="text-right">
            <div class="flex gap-2">
              <!-- Eliminar estudiante -->
              <Button @click="eliminarEstudiante(estudiante.id)" :disabled="disabled" :variant="'outline'"
                class="hover:text-black w-auto bg-(--cgv) border-(--cgv) border-0 text-white">
                <Delete class="w-4 h-4 mr-2" />
              </Button>
              <!-- Editar estudiante -->
              <Button @click="editarEstudiante(estudiante)" :disabled="disabled" :variant="'outline'"
                class="hover:text-black w-auto bg-(--cgv) border-(--cgv) border-0 text-white">
                <Pencil class="w-4 h-4 mr-2" />
              </Button>
              <!-- Descargar matricula -->
              <Button @click="descargarMatricula(estudiante.id)" :disabled="disabled" :variant="'outline'"
                class="hover:text-black w-auto bg-(--cgv) border-(--cgv) border-0 text-white">
                <Download class="w-4 h-4 mr-2" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <!-- Modal de edición -->
    <div v-if="isVisibleModal" class="container-modal absolute">
      <form @submit.prevent="actualizarEstudiante" class="max-w-md mx-auto px-3 py-4 box-modal">
        <div class="grid md:grid-cols-2 md:gap-6" style="margin-bottom:10px;">
          <div class="relative z-0 w-full mb-5 group">
            <input type="text" v-model="form.nombre"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-(--cgv) focus:outline-none focus:ring-0 focus:border-(--cgv) peer"
              required />
            <label for="nombre"
              class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-(--cgv) peer-focus:dark:text-(--cgv) peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
              Nombre
            </label>
          </div>

          <div class="relative z-0 w-full mb-5 group">
            <input type="text" v-model="form.apellido"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-(--cgv) focus:outline-none focus:ring-0 focus:border-(--cgv) peer"
              required />
            <label for="apellido"
              class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-(--cgv) peer-focus:dark:text-(--cgv) peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
              Apellido
            </label>
          </div>
        </div>
        <div class="grid md:grid-cols-2 md:gap-6" style="margin-bottom:10px;">
          <div class="relative z-0 w-full mb-5 group">
            <input type="number" v-model="form.dni"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-(--cgv) focus:outline-none focus:ring-0 focus:border-(--cgv) peer"
              required />
            <label for="dni"
              class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-(--cgv) peer-focus:dark:text-(--cgv) peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
              DNI
            </label>
          </div>
          <div class="grid md:grid-cols-2 md:gap-6" style="margin-bottom:10px;">
          <Select v-model="form.apoderado">
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un apoderado" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Apoderado</SelectLabel>
                <SelectItem v-for="apoderado in apoderados" :key="apoderado.id" :value="apoderado.id">
                  {{ apoderado.nombre }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <Button type="button" @click="cerrarModal" class="hover:text-black bg-red-600 text-white border-0">Cerrar</Button>
          <Button type="submit" :disabled="disabled" class="ml-2 hover:text-black bg-(--cgv) text-white border-0">Guardar cambios</Button>
        </div>
      </form>
    </div>
  </div>
</template>
