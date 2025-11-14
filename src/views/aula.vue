<script setup lang="ts">
import { ref, reactive } from "vue";
import { supabase } from '@/lib/supabaseClient';
import { Delete, Pencil, Download,Plus, PlusCircle, X } from "lucide-vue-next";
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
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Asegúrate de importar la extensión

// Definir los tipos de datos

interface Docente {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  numero: string;
}

interface Aula {
  id: number;
  nombre: string;
  edad: number;
  id_docente: number; // Clave foránea para docente
  docente: Docente | null; // Relación con docente
}

// Estado reactivo
const aulas = ref<Aula[]>([]);
const docentes = ref<Docente[]>([]);
const searchByName = ref<string>('');
const selectedNumber = ref<number>(5);
const isVisibleModal = ref(false);
const message = ref<string>('Empieza creando aulas o eliminarlas');
const disabled = ref<boolean>(false);
const form = reactive({
  nombre: null as null | string,
  edad:null as null | number,
  docente: null as null|number
});
const selectedAula = ref<Aula | null>(null);

// Obtener docentes desde la base de datos
const getDocentes = async () => {
  const { data, error } = await supabase.from('docente').select('*');
  if (error) {
    console.error('Error al obtener docentes:', error);
    return;
  }
  docentes.value = data as Docente[] ?? [];
};

getDocentes();

// Función para cargar las aulas
const getAulas = async () => {
  message.value = 'Cargando aulas...';

  let query = supabase
    .from('aula')
    .select(`id, nombre, edad, id_docente, docente(id, dni, nombre, apellido)`)
    .order('id', { ascending: false });

  if (searchByName.value.trim() !== '') {
    query = query.ilike('nombre', `%${searchByName.value.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    message.value = 'Ocurrió un error al cargar las aulas. Recargue la página.';
    return;
  }

  aulas.value = data as unknown as Aula[] ?? [];
  message.value = `Se cargaron ${aulas.value.length} aulas.`;
};

// Crear aulas
const crearAulas = async (number: number) => {
  if (docentes.value.length === 0) {
    console.error('No hay docentes disponibles.');
    return;
  }

  const aulasArray = [];

  for (let i = 0; i < number; i++) {
    const randomDocente = docentes.value[Math.floor(Math.random() * docentes.value.length)];

    aulasArray.push({
      nombre: faker.word.adjective(),
      edad: faker.number.int({ min: 3, max: 5 }),
      id_docente: (randomDocente as Docente).id,
    });
  }

  const { data, error } = await supabase.from('aula').insert(aulasArray).select('id');

  if (error) {
    console.error('Error al crear aulas:', error);
    return;
  }

  await getAulas(); // Cargar aulas después de la creación
};

// Función para eliminar un aula
const eliminarAula = async (id: number) => {
  disabled.value = true;
  message.value = `Eliminando aula con ID:${id}, espere...`;

  const { data, error } = await supabase.from('aula').delete().eq('id', id).select('id');
  if (error) {
    disabled.value = false;
    message.value = `Ocurrió un error al eliminar el aula con ID:${id}. Intente de nuevo.`;
    return;
  }

  await getAulas();
  disabled.value = false;
  message.value = `Se eliminó el aula con ID:${id}`;
};

// Función para editar aula
const editarAula = async (aula: Aula) => {
  selectedAula.value = aula;
  form.nombre = aula.nombre;
  form.edad = aula.edad;
  form.docente = (aula.docente as Docente).id ;
  isVisibleModal.value = true;
};

// Función para actualizar aula
const actualizarAula = async () => {
   if (!selectedAula.value) {
    return crearAulaenSupabase()
  }
  disabled.value = true;

  const { nombre, edad, docente } = form;

  const { data, error } = await supabase
    .from('aula')
    .update({ nombre, edad: Number(edad), id_docente: Number(docente) })
    .eq('id', selectedAula.value?.id as number)
    .select('id');

  if (error) {
    disabled.value = false;
    message.value = `Ocurrió un error al actualizar el aula con ID:${selectedAula.value?.id}. Intente de nuevo.`;
    return;
  }

  await getAulas();
  isVisibleModal.value = false;

  disabled.value = false;
  message.value = `Aula actualizada correctamente.`;
};


// Inicializar datos al cargar el componente
; (async () => {
  await getAulas();
  await getDocentes();
})();


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

const descargarMatriculasAula = async (idAula: number) => {
  // Verificar si el aula tiene matrículas
  const { data: matriculas, error } = await supabase
    .from('matricula')
    .select(`
      id, fecha,
      aula (nombre),
      estudiante (nombre, apellido),
      precio
    `)
    .eq('id_aula', idAula)
    .order('fecha', { ascending: false }); // Traemos todas las matrículas del aula

  if (error || !matriculas.length) {
    message.value = 'No se encontraron matrículas para este aula.';
    return;
  }

  // Crear un nuevo documento PDF
  const doc = new jsPDF();

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`Matrículas del Aula: ${(matriculas as Matricula[])[0]?.aula.nombre}`, 20, 20);

  // Establecemos las posiciones iniciales para la tabla
  let yPosition = 30;

  // Dibujar encabezados de la tabla
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  const headers = ['Estudiante', 'Fecha de Matrícula', 'Precio'];

  let xPosition = 20;
  headers.forEach((header, index) => {
    doc.text(header, xPosition, yPosition);
    xPosition += 50; // Ajustar el ancho de las columnas
  });

  yPosition += 10; // Separar encabezados de las filas de datos

  // Dibujar las filas de la tabla
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  matriculas.forEach((matricula, index) => {
    xPosition = 20;

    // Estudiante
    doc.text(`${(matricula as Matricula).estudiante.nombre} ${(matricula as Matricula).estudiante.apellido}`, xPosition, yPosition);
    xPosition += 50;

    // Fecha de matrícula
    doc.text(new Date((matricula as Matricula).fecha).toLocaleDateString(), xPosition, yPosition);
    xPosition += 50;

    // Precio
    doc.text(`PEN ${(matricula as Matricula).precio}`, xPosition, yPosition);

    yPosition += 10; // Mover hacia abajo para la siguiente fila

    // Si es necesario, agregar un salto de página
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
  });

  // Descargar el archivo PDF
  doc.save(`matriculas_aula_${idAula}.pdf`);
};


// Cerrar modal
const cerrarModal = () => {
  isVisibleModal.value = false;
  selectedAula.value = null
};

const crearAula = () => {
  selectedAula.value = null
  form.edad = null;
  form.nombre = null;
  form.docente=null
  isVisibleModal.value = true;
}
const crearAulaenSupabase = async () => {

  const { nombre, edad, docente } = form;
// Verificar si el docente ya está asignado a un aula
const { data: aulaExistente, error: errorExistente } = await supabase
  .from('aula')
  .select('id')
  .eq('id_docente', Number(docente))
  .single();

if (aulaExistente) {
  message.value = 'Este docente ya está asignado a un aula.';
  return;
}
  // Insertar la matrícula en la base de datos
  const { data, error } = await supabase
    .from('aula')
    .insert([{
      nombre:nombre,
      edad:edad,
      id_docente: Number(docente)
    }])
    .select('id');

  // Cerrar modal y manejar errores
  cerrarModal();
  if (error) {
    console.error('Error al crear Aula:', error);
    message.value = 'Hubo un error al crear la Aula.';
    return;
  }

  // Recargar las matrículas
  await getAulas();
  message.value = 'Aula creada correctamente';
};
</script>


<template>
  <div class="relative">
    <h1>Aulas</h1>

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
        <Button @click="getAulas()" :disabled="disabled" :variant="'outline'"
          class="hover:text-black w-36 bg-black border-(-cgv) border-0 text-(--cgv)">
          <Plus class="w-4 h-4 mr-2" />Buscar
        </Button>
        <Button @click="crearAula()" :disabled="disabled" :variant="'outline'"
          class="hover:text-black w-36 bg-(--cgv) border-(--cgv) border-0 text-white">
          <Plus class="w-4 h-4 mr-2" />Crear Aula
        </Button>
        <!-- <Button @click="crearAulas(1)" :disabled="disabled" :variant="'outline'"
          class="hover:text-black w-36 bg-(--cgv) border-(--cgv) border-0 text-white">
          <Plus class="w-4 h-4 mr-2" />Crear 1 aula
        </Button>
        <Button @click="crearAulas(5)" :disabled="disabled" :variant="'outline'"
          class="hover:text-black w-36 bg-(--cgv) border-(--cgv) border-0 text-white">
          <PlusCircle class="w-4 h-4 mr-2" />Crear 5 aulas
        </Button> -->
      </div>
    </div>

    <!-- Tabla de aulas -->
    <Table>
      <TableCaption>Una lista de tus recientes aulas.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead class="w-[100px]">Id</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Edad</TableHead>
          <TableHead>Docente</TableHead>
          <TableHead class="text-right">Opciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="aula in aulas" :key="aula.id">
          <TableCell class="font-medium">{{ aula.id }}</TableCell>
          <TableCell>{{ aula.nombre }}</TableCell>
          <TableCell>{{ aula.edad }}</TableCell>
          <TableCell>{{ aula.docente?.nombre || 'No asignado' }}</TableCell>
          <TableCell class="text-right">
            <div class="flex gap-2">
              <!-- Eliminar aula -->
              <Button @click="eliminarAula(aula.id)" :disabled="disabled" :variant="'outline'"
                class="hover:text-black w-auto bg-(--cgv) border-(--cgv) border-0 text-white">
                <Delete class="w-4 h-4 mr-2" />
              </Button>
              <!-- Editar aula -->
              <Button @click="editarAula(aula)" :disabled="disabled" :variant="'outline'"
                class="hover:text-black w-auto bg-(--cgv) border-(--cgv) border-0 text-white">
                <Pencil class="w-4 h-4 mr-2" />
              </Button>
                      <!-- Descargar matricula -->
              <Button @click="descargarMatriculasAula(aula.id)" :disabled="disabled" :variant="'outline'"
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
      <form @submit.prevent="actualizarAula" class="max-w-md mx-auto px-3 py-4 box-modal">
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
            <input type="number" v-model="form.edad"
            min="3" max="5"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-(--cgv) focus:outline-none focus:ring-0 focus:border-(--cgv) peer"
              required />
            <label for="edad"
              class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-(--cgv) peer-focus:dark:text-(--cgv) peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
              Edad
            </label>
          </div>
        </div>

        <div class="grid md:grid-cols-2 md:gap-6" style="margin-bottom:10px;">
          <Select v-model="form.docente">
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un docente" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Docentes</SelectLabel>
                <SelectItem v-for="docente in docentes" :key="docente.id" :value="docente.id">
                  {{ docente.nombre }}
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

