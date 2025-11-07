<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const formSchema = toTypedSchema(z.object({
  username: z.string().min(2,'largo mayor a 2').max(50,'largo menor a 50'),
  password: z.string().min(2).max(50),
}))

const form = useForm({
  validationSchema: formSchema,
})

const onSubmit = form.handleSubmit((values) => {
  console.log('Form submitted!', values)
})
</script>

<template>
  <form @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="username">
      <FormItem>
        <FormLabel>Nombre</FormLabel>
        <FormControl>
          <Input type="text" placeholder="shadcn" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          Nombre debe ser de largo de 2 a 50.
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="password">
      <FormItem>
        <FormLabel>Contraseña</FormLabel>
        <FormControl>
          <Input type="text" placeholder="shadcn" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          Contraseña debe ser de largo de 2 a 50.
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <Button type="submit">
      Ingresar
    </Button>
  </form>
  <Avatar>
    <AvatarImage src="https://github.com/unovue.png" alt="@unovue" />
    <AvatarFallback>CN</AvatarFallback>
  </Avatar>
  <DropdownMenu>
    <DropdownMenuTrigger>Abrir</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>My cuenta</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Mi perfil</DropdownMenuItem>
      <DropdownMenuItem>Mis compras</DropdownMenuItem>
      <DropdownMenuItem>Mi plan</DropdownMenuItem>
      <DropdownMenuItem>Cerrar sesión</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
<style scoped>

</style>
